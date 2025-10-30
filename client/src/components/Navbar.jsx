import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-semibold text-blue-600">MERN Blog</Link>
      <div className="flex gap-3">
        <Link to="/create">
          <Button>Create Post</Button>
        </Link>
      </div>
    </nav>
  );
}
