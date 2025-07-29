import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";

export const testRouter = createTRPCRouter({
  getUsers: baseProcedure
    .query(async () => {
      return {
        users: [
          { id: 1, name: "John Doe", email: "john@example.com" },
          { id: 2, name: "Jane Smith", email: "jane@example.com" },
        ],
      };
    }),

  getUserById: baseProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const users = [
        { id: 1, name: "John Doe", email: "john@example.com" },
        { id: 2, name: "Jane Smith", email: "jane@example.com" },
      ];
      
      const user = users.find(u => u.id === input.id);
      if (!user) {
        throw new Error("User not found");
      }
      
      return { user };
    }),

  createUser: baseProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        user: {
          id: Math.floor(Math.random() * 1000),
          name: input.name,
          email: input.email,
        },
      };
    }),

  updateUser: baseProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: `User ${input.id} updated successfully`,
        updatedFields: {
          ...(input.name && { name: input.name }),
          ...(input.email && { email: input.email }),
        },
      };
    }),
});