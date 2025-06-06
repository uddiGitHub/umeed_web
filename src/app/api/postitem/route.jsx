import mongoose from "mongoose";
import PostItem from "../../../../models/postItem.jsx";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "../../../../config/db.jsx";

// Connect to database
connectDB();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const searchQuery = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    let filter = {};
    if (searchQuery) {
      filter = {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { content: { $regex: searchQuery, $options: 'i' } }
        ]
      };
    }

    const totalCount = await PostItem.countDocuments(filter);
    const posts = await PostItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      posts,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      limit
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Authenticate user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Create and save new post
    const newPost = new PostItem({
      ...data,
      author: userId
    });

    const savedPost = await newPost.save();

    return NextResponse.json(savedPost, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}