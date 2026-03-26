import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import { Container, Typography, Stack } from "@mui/material";

export default function HomePage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await apiRequest("/posts");
        setPosts(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <Navbar />

      <Container maxWidth="md">
        <CreatePost setPosts={setPosts} />

        <Typography variant="h4" sx={{ mb: 3 }}>
          Feed
        </Typography>

        <Stack spacing={3}>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} setPosts={setPosts} />
          ))}
        </Stack>
      </Container>
    </div>
  );
}
