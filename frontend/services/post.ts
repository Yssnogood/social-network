import { getCookies } from "next-client-cookies/server";

const url = "http://localhost:8080/api"
export interface Post {
  id: number;
  userId: string;
  userName: string;
  content: string;
  privacy: number;
  imageUrl?: string;
  createdAt: Date;
  likes: number;
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
                  likes: 0,
                  comments: post.post.comments_count
                  
                }
        posts.push(newPost)
      }
    }
  } catch (err) {
    if (err) {
      console.log(err)
    }
  }
  return posts;
}

/**
 * Creates a new post
 * @param postData New post data
 * @returns The created post object
 */
export async function createPost(postData: { 
  content: string;
  privacy: number
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
    comments: 0
  };
        try {
            const resp = await fetch(url+"/post",{
                method: "POST",
                body: JSON.stringify({
                    jwt: jwt,
                    content: postData.content,
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
                  comments: 0

                }
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

