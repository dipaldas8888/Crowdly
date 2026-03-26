import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function PostCard({ post, setPosts }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");

  const handleLike = async () => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === post._id
          ? {
              ...p,
              likes: p.likes.some((u) => u._id === user._id)
                ? p.likes.filter((u) => u._id !== user._id)
                : [...p.likes, user],
            }
          : p,
      ),
    );

    try {
      const updatedPost = await apiRequest(`/posts/like/${post._id}`, {
        method: "PUT",
      });

      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? updatedPost : p)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    const newComment = {
      user,
      text: commentText,
    };

    setPosts((prev) =>
      prev.map((p) =>
        p._id === post._id
          ? {
              ...p,
              comments: [...p.comments, newComment],
            }
          : p,
      ),
    );

    setCommentText("");

    try {
      const updatedPost = await apiRequest(`/posts/comment/${post._id}`, {
        method: "POST",
        body: { text: newComment.text },
      });

      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? updatedPost : p)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{post.user?.username}</Typography>

        <Typography sx={{ mt: 1 }}>{post.text}</Typography>

        {post.image && (
          <img
            src={post.image}
            alt=""
            style={{ width: "100%", marginTop: 10 }}
          />
        )}

        <Button onClick={handleLike} sx={{ mt: 2 }}>
          👍 {post.likes.length}
        </Button>

        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
          {post.likes.map((u) => (
            <Typography key={u._id} variant="caption">
              {u.username}
            </Typography>
          ))}
        </Stack>

        <Stack spacing={1} sx={{ mt: 2 }}>
          {post.comments.map((c, i) => (
            <Typography key={i}>
              <b>{c.user?.username}:</b> {c.text}
            </Typography>
          ))}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button variant="contained" onClick={handleComment}>
            Post
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
