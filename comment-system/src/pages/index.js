import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function Home() {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiReply, setShowEmojiReply] = useState(null);
  const [filter, setFilter] = useState("latest"); 


  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(false);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() === "") return;

    const newComment = {
      id: Date.now(),
      text,
      avatar: text.trim().charAt(0).toUpperCase(),
      date: new Date(),
      replies: [],
      likes: 0,
      dislikes: 0,
      liked: false,
      disliked: false,
    };

    setComments([...comments, newComment]);
    setText("");
    setShowEmoji(false);
  };


  const handleDelete = (id) => {
    setComments(comments.filter((c) => c.id !== id));
  };

 
  const handleReply = (id) => {
    if (!replyText[id] || replyText[id].trim() === "") return;

    const updatedComments = comments.map((comment) => {
      if (comment.id === id) {
        return {
          ...comment,
          replies: [
            ...comment.replies,
            {
              id: Date.now(),
              text: replyText[id],
              avatar: replyText[id].trim().charAt(0).toUpperCase(),
              date: new Date(),
              likes: 0,
              dislikes: 0,
              liked: false,
              disliked: false,
            },
          ],
        };
      }
      return comment;
    });

    setComments(updatedComments);
    setReplyText({ ...replyText, [id]: "" });
    setReplyingTo(null);
    setShowEmojiReply(null);
  };


  const handleReaction = (id, type, isReply = false, parentId = null) => {
    const updatedComments = comments.map((comment) => {
      if (isReply && comment.id === parentId) {
        const updatedReplies = comment.replies.map((reply) => {
          if (reply.id === id) {
            if (type === "like") {
              const liked = !reply.liked;
              return {
                ...reply,
                liked,
                disliked: liked ? false : reply.disliked,
                likes: liked ? reply.likes + 1 : reply.likes - 1,
                dislikes: liked && reply.disliked ? reply.dislikes - 1 : reply.dislikes,
              };
            } else {
              const disliked = !reply.disliked;
              return {
                ...reply,
                disliked,
                liked: disliked ? false : reply.liked,
                dislikes: disliked ? reply.dislikes + 1 : reply.dislikes - 1,
                likes: disliked && reply.liked ? reply.likes - 1 : reply.likes,
              };
            }
          }
          return reply;
        });
        return { ...comment, replies: updatedReplies };
      } else if (!isReply && comment.id === id) {
        if (type === "like") {
          const liked = !comment.liked;
          return {
            ...comment,
            liked,
            disliked: liked ? false : comment.disliked,
            likes: liked ? comment.likes + 1 : comment.likes - 1,
            dislikes: liked && comment.disliked ? comment.dislikes - 1 : comment.dislikes,
          };
        } else {
          const disliked = !comment.disliked;
          return {
            ...comment,
            disliked,
            liked: disliked ? false : comment.liked,
            dislikes: disliked ? comment.dislikes + 1 : comment.dislikes - 1,
            likes: disliked && comment.liked ? comment.likes - 1 : comment.likes,
          };
        }
      }
      return comment;
    });

    setComments(updatedComments);
  };

  const onEmojiClick = (emojiData) => setText((prev) => prev + emojiData.emoji);
  const onEmojiClickReply = (id, emojiData) =>
    setReplyText({ ...replyText, [id]: (replyText[id] || "") + emojiData.emoji });


  const sortedComments = () => {
    if (filter === "latest") {
      return [...comments].sort((a, b) => b.date - a.date);
    } else if (filter === "mostLiked") {
      return [...comments].sort((a, b) => b.likes - a.likes);
    }
    return comments;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
          💬 Sistemi i Komenteve
        </h1>

       
        <div className="flex justify-end mb-4">
          <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setOpenDropdown(!openDropdown)}
              className="inline-flex justify-center w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-white font-bold shadow-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
            >
              {filter === "latest" ? "🕒 Më të fundit" : "🔥 Më të pëlqyerit"}
              <svg
                className={`-mr-1 ml-2 h-5 w-5 transform transition-transform duration-200 ${openDropdown ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.585l3.71-4.354a.75.75 0 111.14.976l-4 4.7a.75.75 0 01-1.14 0l-4-4.7a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {openDropdown && (
              <div className="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                <div className="py-1">
                  <button
                    onClick={() => { setFilter("latest"); setOpenDropdown(false); }}
                    className={`block px-4 py-2 text-sm font-bold w-full text-left transition-all duration-150 ${
                      filter === "latest"
                        ? "bg-gradient-to-r from-blue-400 to-purple-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    } rounded-md`}
                  >
                    🕒 Më të fundit
                  </button>
                  <button
                    onClick={() => { setFilter("mostLiked"); setOpenDropdown(false); }}
                    className={`block px-4 py-2 text-sm font-bold w-full text-left transition-all duration-150 ${
                      filter === "mostLiked"
                        ? "bg-gradient-to-r from-blue-400 to-purple-500 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    } rounded-md`}
                  >
                    🔥 Më të pëlqyerit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

    
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6 relative">
          <div className="flex-1 relative">
            <input
              type="text"
              className={`w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm placeholder-gray-400 placeholder:italic transition-all duration-200
                ${text ? "font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" : "font-medium text-gray-800"}`}
              placeholder="✍️ Shkruaj një koment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">
              😀
            </button>
          </div>
          <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-transform transform hover:scale-105">
            ➕ Shto
          </button>
        </form>

        {showEmoji && <div className="absolute z-10 mt-[-20px]"><EmojiPicker onEmojiClick={onEmojiClick} /></div>}

       
        <ul className="space-y-4">
          {sortedComments().map((comment) => (
            <li key={comment.id} className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold text-xl shadow-md">{comment.avatar}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-500">{comment.date.toLocaleString()}</span>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline text-sm font-medium" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>Përgjigju</button>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow" onClick={() => handleDelete(comment.id)}>Fshij</button>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-2">{comment.text}</p>

                  <div className="flex gap-2 mb-2">
                    <button onClick={() => handleReaction(comment.id, "like")} className={`px-3 py-1 rounded-lg text-sm font-medium shadow transition ${comment.liked ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>👍 {comment.likes}</button>
                    <button onClick={() => handleReaction(comment.id, "dislike")} className={`px-3 py-1 rounded-lg text-sm font-medium shadow transition ${comment.disliked ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>👎 {comment.dislikes}</button>
                  </div>

          
                  {replyingTo === comment.id && (
                    <div className="mb-3">
                      <div className="flex gap-2 relative mt-3">
                        <input
                          type="text"
                          className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200
                            ${replyText[comment.id] ? "font-bold text-base text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600" : "text-gray-700"}`}
                          placeholder="💭 Shkruaj një përgjigje..."
                          value={replyText[comment.id] || ""}
                          onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                        />
                        <button type="button" onClick={() => setShowEmojiReply(showEmojiReply === comment.id ? null : comment.id)} className="absolute right-16 top-1/2 -translate-y-1/2 text-xl">😀</button>
                        <button onClick={() => handleReply(comment.id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow">Dërgo</button>
                      </div>
                      {showEmojiReply === comment.id && <div className="mt-2"><EmojiPicker onEmojiClick={(emoji) => onEmojiClickReply(comment.id, emoji)} /></div>}
                    </div>
                  )}

                  {comment.replies.length > 0 && (
                    <ul className="ml-6 mt-2 space-y-2">
                      {comment.replies.map((reply) => (
                        <li key={reply.id} className="flex gap-3 items-start bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-sm shadow">{reply.avatar}</div>
                          <div>
                            <span className="text-xs text-gray-500">{reply.date.toLocaleString()}</span>
                            <p className="text-sm font-medium text-gray-800 mb-1">{reply.text}</p>
                            <div className="flex gap-2">
                              <button onClick={() => handleReaction(reply.id, "like", true, comment.id)} className={`px-2 py-1 rounded-lg text-xs font-medium shadow transition ${reply.liked ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>👍 {reply.likes}</button>
                              <button onClick={() => handleReaction(reply.id, "dislike", true, comment.id)} className={`px-2 py-1 rounded-lg text-xs font-medium shadow transition ${reply.disliked ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>👎 {reply.dislikes}</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
