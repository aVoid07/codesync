import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAllInterviews = query({
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        console.log("No identity found in getAllInterviews");
        return [];
      }

      console.log("User identity in getAllInterviews:", identity);

      const interviews = await ctx.db.query("interviews").collect();
      console.log(`Fetched ${interviews.length} interviews`);
      
      // Log each interview's status and start time
      interviews.forEach(interview => {
        console.log(`Interview ${interview._id}:`, {
          status: interview.status,
          startTime: new Date(interview.startTime).toISOString(),
          title: interview.title
        });
      });

      return interviews;
    } catch (error) {
      console.error("Error in getAllInterviews:", error);
      return [];
    }
  },
});

export const getMyInterviews = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_candidate_id", (q) => q.eq("candidateId", identity.subject))
      .collect();

    return interviews!;
  },
});

export const getInterviewByStreamCallId = query({
  args: { streamCallId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("interviews")
      .withIndex("by_stream_call_id", (q) => q.eq("streamCallId", args.streamCallId))
      .first();
  },
});

export const createInterview = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.number(),
    status: v.string(),
    streamCallId: v.string(),
    candidateId: v.string(),
    interviewerIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("createInterview called with args:", args);
    
    const identity = await ctx.auth.getUserIdentity();
    console.log("Identity in createInterview:", identity);
    
    if (!identity) {
      console.error("No identity found in createInterview");
      throw new Error("Unauthorized - Please sign in to create an interview");
    }

    try {
      // Determine the initial status based on start time
      const now = Date.now();
      const initialStatus = args.startTime > now ? "upcoming" : "completed";

      // Create the interview
      const result = await ctx.db.insert("interviews", {
        ...args,
        status: initialStatus,
      });
      console.log("Interview created successfully:", result);
      return result;
    } catch (error) {
      console.error("Error creating interview:", error);
      throw error;
    }
  },
});

export const updateInterviewStatus = mutation({
  args: {
    id: v.id("interviews"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: args.status,
      ...(args.status === "completed" ? { endTime: Date.now() } : {}),
    });
  },
});
