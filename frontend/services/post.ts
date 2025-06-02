export interface Post {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  likes: number;
  comments: number;
}

// Mock data for posts
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Jane Doe',
    title: 'First Post',
    content: 'Just joined this amazing social network! Looking forward to connecting with everyone.',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 15,
    comments: 3
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'John Smith',
    title: 'Hello World',
    content: 'Hello everyone! This is my first post. I\'m excited to share my journey with all of you.',
    imageUrl: '/sample-post-image.jpg',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    likes: 8,
    comments: 2
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Alex Johnson',
    title: 'Tech News',
    content: 'Just read about the latest advancements in AI. The future looks promising! What do you think?',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    likes: 23,
    comments: 7
  }
];

/**
 * Fetches all posts
 * In a real app, this would make an API call to get posts
 */
export async function getPosts(): Promise<Post[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...MOCK_POSTS];
}

/**
 * Creates a new post
 * @param postData New post data
 * @returns The created post object
 */
export async function createPost(postData: { 
  userId: string;
  userName: string;
  title: string;
  content: string;
  imageUrl?: string;
}): Promise<Post> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newPost: Post = {
    ...postData,
    id: Math.random().toString(36).substring(2, 15),
    createdAt: new Date(),
    likes: 0,
    comments: 0
  };
  
  // In a real app, we would send this to the server
  // and get back the saved post
  return newPost;
}
