import { getCookies } from "next-client-cookies/server";

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

// Mock data for posts
const MOCK_POSTS: Post[] = [
  {
    id: 1,
    userId: 'user1',
    userName: 'Jane Doe',
    content: 'Just joined this amazing social network! Looking forward to connecting with everyone.',
    privacy: 0,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 15,
    liked:true,
    comments: 3
  },
  {
    id: 2,
    userId: 'user2',
    userName: 'John Smith',
    content: 'Hello everyone! This is my first post. I\'m excited to share my journey with all of you.',
    privacy: 0,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    likes: 8,
    liked:true,
    comments: 2
  },
  {
    id: 3,
    userId: 'user3',
    userName: 'Alex Johnson',
    content: 'Just read about the latest advancements in AI. The future looks promising! What do you think?',
    privacy: 0,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    likes: 23,
    liked:true,
    comments: 7
  }
];

/**
 * Fetches all posts
 * In a real app, this would make an API call to get posts
 */
export async function getPosts(jwt?:string): Promise<Post[]> {
  let posts: Post[] = [];
  try {
    const resp = await fetch(url+"/posts",{
      method: "POST",
      body: JSON.stringify({
        jwt: jwt
      })
    })
    if (resp.ok) {
      const r = await resp.json()
      for (const post of r) {
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
        posts.push(newPost)
        console.log(newPost)
        console.log(newPost.userName)
      }
    }
  } catch (err) {
    if (err) {
      console.log(err)
    }
  }
  return posts;
}

export async function LikePost(post_id:number, jwt?:string) {
  const resp = await fetch(url+'/like',{
    method: "POST",
    body: JSON.stringify({
      jwt: jwt,
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

export async function getSpecificPost(post_id: number, jwt?: string): Promise<Post | null> {
  let newPost: Post | null = null;
  try {
    const resp = await fetch(url+`/posts/${post_id}`, {
      method: "POST",
      body: JSON.stringify({ jwt })
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
},jwt?:string): Promise<Post> {
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
                body: JSON.stringify({
                    jwt: jwt,
                    content: postData.content,
                    image_path: postData.imageUrl,
                    viewers: postData.viewers,
                    privacy_type: postData.privacy
                })
            })
            if (resp.ok) {
                const r = await resp.json()
                newPost = {
                  id: r.post.id,
                  userId: r.post.user_id,
                  userName: r.username,
                  imageUrl: r.post.image_path,
                  privacy: r.post.privacy_type,
                  createdAt: new Date(Date.parse(r.post.created_at)),
                  content: r.post.content,
                  likes: 0,
                  liked:false,
                  comments: 0

                }
                console.log(newPost)
            } else {
                console.log(resp.status)
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
      headers: { "Content-Type": "application/json" },
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

