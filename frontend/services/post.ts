const url = "http://localhost:8090/api"
export interface Post {
  id: number;
  userId: string;
  userName: any;
  content: string;
  privacy: number;
  imageUrl?: string;
  createdAt: Date;
  likes: number;
  dislikes: number;
  liked: boolean;
  disliked: boolean;
  comments: number;
}


/**
 * Fetches all posts
 * In a real app, this would make an API call to get posts
 */
export async function getPosts(): Promise<Post[]> {
  let posts: Post[] = [];
  try {
    const resp = await fetch(url+"/posts",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    })
    if (resp.ok) {
      const r = await resp.json()
      console.log("Raw response from getPosts:", r)
      for (const post of r) {
        console.log("Processing post:", post)
        const newPost : Post = {
                  id: post.post.id,
                  userId: post.post.user_id,
                  userName: post.user,
                  imageUrl: post.post.image_path,
                  privacy: post.post.privacy_type,
                  createdAt: new Date(Date.parse(post.post.created_at)),
                  content: post.post.content,
                  likes: post.like || 0,
                  dislikes: post.dislike || 0,
                  liked: post.user_liked || false,
                  disliked: post.user_disliked || false,
                  comments: post.post.comments_count

                }
        console.log("Mapped post:", newPost)
        console.log("Post content:", newPost.content)
        posts.push(newPost)
      }
    } else {
      console.error("getPosts failed:", resp.status, resp.statusText)
    }
  } catch (err) {
    if (err) {
      console.log(err)
    }
  }
  return posts;
}

export async function LikePost(post_id: number): Promise<{ status: string; likes: number; dislikes: number } | null> {
  try {
    const resp = await fetch(url + '/like', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        post_id: post_id
      })
    });
    
    if (resp.ok) {
      const data = await resp.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error liking post:", error);
    return null;
  }
}

export async function DislikePost(post_id: number): Promise<{ status: string; likes: number; dislikes: number } | null> {
  try {
    const resp = await fetch(url + '/dislike', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        post_id: post_id
      })
    });
    
    if (resp.ok) {
      const data = await resp.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error disliking post:", error);
    return null;
  }
}

export async function getSpecificPost(post_id: number): Promise<Post | null> {
  let newPost: Post | null = null;
  try {
    const resp = await fetch(url+`/posts/${post_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });
    if (resp.ok) {
      const r = await resp.json();
      newPost = {
        id: r.post.id,
        userId: r.post.user_id,
        userName: r.user ?? r.post.post_author ?? "Unknown",
        imageUrl: r.post.image_path,
        privacy: r.post.privacy_type,
        createdAt: new Date(Date.parse(r.post.created_at)),
        content: r.post.content,
        likes: r.likes || 0,
        dislikes: r.dislikes || 0,
        liked: r.liked || false,
        disliked: r.disliked || false,
        comments: r.post.comments_count
      };
      console.log(newPost)
    }
  } catch (err) {
    console.log(err);
  }
  return newPost;
}


/**
 * Creates a new post
 * @param postData New post data
 * @returns The created post object
 */
export async function createPost(postData: { 
  content: string;
  privacy: number;
  viewers: number[];
  imageUrl?: string;
}): Promise<Post> {
  let newPost: Post = {
    userId: "",
    userName: "",
    content:"",
    privacy:0,
    id: 0,
    createdAt: new Date(),
    likes: 0,
    dislikes: 0,
    liked: false,
    disliked: false,
    comments: 0
  };
        try {
            const resp = await fetch(url+"/post",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    content: postData.content,
                    image_path: postData.imageUrl,
                    viewers: postData.viewers,
                    privacy_type: postData.privacy
                })
            })
            if (resp.ok) {
                const r = await resp.json()
                console.log("Raw response from createPost:", r)
                newPost = {
                  id: r.post.id,
                  userId: r.post.user_id,
                  userName: r.user,
                  imageUrl: r.post.image_path,
                  privacy: r.post.privacy_type,
                  createdAt: new Date(Date.parse(r.post.created_at)),
                  content: r.post.content,
                  likes: r.like || 0,
                  dislikes: r.dislike || 0,
                  liked: r.user_liked || false,
                  disliked: r.user_disliked || false,
                  comments: 0

                }
                console.log("Mapped createPost:", newPost)
                console.log("Create post content:", newPost.content)
            } else {
                console.log("createPost failed:", resp.status, resp.statusText)
            }
        } catch (err) {
            console.log(err)
        }
  
  // In a real app, we would send this to the server
  // and get back the saved post
  return newPost;
}

export async function getPostsByUserID(userID: number): Promise<Post[]> {
  let posts: Post[] = [];
  try {
    const resp = await fetch(url + "/posts_user", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        user_id: userID
      })
    });
    if (resp.ok) {
      const r = await resp.json();
      for (const postData of r) {
        const newPost: Post = {
          id: postData.post.id,
          userId: postData.post.user_id,
          userName: postData.user,
          imageUrl: postData.post.image_path,
          privacy: postData.post.privacy_type,
          createdAt: new Date(Date.parse(postData.post.created_at)),
          content: postData.post.content,
          likes: postData.like,
          liked: postData.user_liked,
          comments: postData.comments_count
        };
        posts.push(newPost);
      }
    }
  } catch (err) {
    console.log(err);
  }
  return posts;
}

export async function getLikedPostsByUserID(userID: number): Promise<Post[]> {
  let posts: Post[] = [];
  try {
    const resp = await fetch(url + "/liked_posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        user_id: userID
      })
    });

    if (resp.ok) {
      const r = await resp.json();
      const likedPosts = r.liked_posts;

      for (const postData of likedPosts) {
        const newPost: Post = {
          id: postData.post.id,
          userId: postData.post.user_id,
          userName: postData.user,
          imageUrl: postData.post.image_path,
          privacy: postData.post.privacy_type,
          createdAt: new Date(Date.parse(postData.post.created_at)),
          content: postData.post.content,
          likes: postData.like,
          liked: true,
          comments: postData.comments_count
        };
        posts.push(newPost);
      }
    }
  } catch (err) {
    console.log("Erreur lors de la récupération des posts likés :", err);
  }

  return posts;
}

