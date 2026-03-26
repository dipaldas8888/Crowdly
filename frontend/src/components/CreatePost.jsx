import { useState } from "react";
import { Card, CardContent, TextField, Button, Stack } from "@mui/material";
import { apiRequest } from "../lib/api";

export default function CreatePost({ setPosts }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text && !image) return;

    const formData = new FormData();
    formData.append("text", text);

    if (image) {
      formData.append("image", image);
    }

    try {
      setLoading(true);

      const newPost = await apiRequest("/posts", {
        method: "POST",
        body: formData,
      });

      setPosts((prev) => [newPost, ...prev]);

      setText("");
      setImage(null);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack spacing={2}>
          <TextField
            multiline
            rows={3}
            placeholder="What's on your mind?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            fullWidth
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          {image && (
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              style={{
                width: "100%",
                maxHeight: 200,
                objectFit: "cover",
              }}
            />
          )}

          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Posting..." : "Post"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
