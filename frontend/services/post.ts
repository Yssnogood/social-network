const url = "http://localhost:8080/api"
export interface Post {
  id: number;
  userId: string;
  userName: any;
  content: string;
  privacy: number;
  imageUrl?: string;
  createdAt: Date;
  likes: number;
  liked: boolean;
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
                  likes: post.like,
                  liked: post.user_liked,
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

export async function LikePost(post_id:number) {
  const resp = await fetch(url+'/like',{
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      post_id: post_id
    })
  })
  if (resp.ok) {
    let post = document.getElementById(String(post_id))
    let like_button = post?.querySelector('.like')
    let like_count = document.getElementById(`like ${post_id}`)
    if (like_button?.classList.contains("liked")) {
      like_button.classList.remove("liked")
      if (like_count) {
        like_count.innerText = String(Number(like_count.innerText) - 1)
      }
    } else {
      like_button?.classList.add("liked")
      if (like_count) {
        like_count.innerText = String(Number(like_count.innerText) + 1)
      }
    }
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
        likes:r.likes, // needs to be changed to get the proper like count
        liked: r.liked, // same, doesn't know if the user liked the post
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
    liked:false,
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
                  likes: r.like,
                  liked: r.user_liked,
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

