import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{post.content.slice(0, 100)}...</p>
        <Link to={`/posts/${post._id}`} className="text-blue-500 text-sm">
          Read More →
        </Link>
      </CardContent>
    </Card>
  );
}
