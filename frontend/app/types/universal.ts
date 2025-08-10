// Types universels pour unifier Post et GroupPost

export interface UniversalPost {
  // Champs communs
  id: number;
  content: string;
  createdAt: Date;
  
  // Auteur unifié
  userId: number;
  userName: string;
  userAvatar?: string;
  userInfo?: any; // Pour les infos supplémentaires (is_public, about_me, etc.)
  
  // Image unifiée
  imageUrl?: string;
  
  // Engagement unifié
  likesCount: number;
  dislikesCount: number;
  userLiked: boolean;
  userDisliked: boolean;
  commentsCount: number;
  
  // Contexte
  context: 'feed' | 'group';
  groupId?: number; // Pour les posts de groupe
  privacy?: number; // Pour les posts du feed (0: public, 1: friends, 2: private)
  
  // Champs originaux pour la rétrocompatibilité
  originalPost?: any;
}

// Fonction pour convertir un Post en UniversalPost
export function postToUniversal(post: any): UniversalPost {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt instanceof Date ? post.createdAt : new Date(post.createdAt),
    
    userId: typeof post.userId === 'string' ? parseInt(post.userId) : post.userId,
    userName: post.userName?.username || post.userName || 'Unknown',
    userAvatar: post.userName?.avatar_path,
    userInfo: post.userName,
    
    imageUrl: post.imageUrl || post.image_path,
    
    likesCount: post.likes || post.like || post.likes_count || 0,
    dislikesCount: post.dislikes || post.dislike || post.dislikes_count || 0,
    userLiked: post.liked || post.user_liked || false,
    userDisliked: post.disliked || post.user_disliked || false,
    commentsCount: post.comments || post.comments_count || 0,
    
    context: 'feed',
    privacy: post.privacy || post.privacy_type,
    
    originalPost: post
  };
}

// Fonction pour convertir un GroupPost en UniversalPost
export function groupPostToUniversal(post: any): UniversalPost {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.created_at instanceof Date ? post.created_at : new Date(post.created_at),
    
    userId: post.user_id,
    userName: post.username,
    userAvatar: undefined, // Les GroupPost n'ont pas d'avatar directement
    userInfo: undefined,
    
    imageUrl: post.image_path,
    
    likesCount: post.likes_count || 0,
    dislikesCount: post.dislikes_count || 0,
    userLiked: post.user_liked || false,
    userDisliked: post.user_disliked || false,
    commentsCount: post.comments_count || 0,
    
    context: 'group',
    groupId: post.group_id,
    
    originalPost: post
  };
}

// Fonction universelle pour convertir n'importe quel post
export function toUniversalPost(post: any, context: 'feed' | 'group' = 'feed'): UniversalPost {
  if (context === 'group' || post.group_id) {
    return groupPostToUniversal(post);
  }
  return postToUniversal(post);
}