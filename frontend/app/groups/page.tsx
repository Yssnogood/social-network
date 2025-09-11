"use client";

import { useEffect, useState } from "react";
import { useCookies } from "next-client-cookies";
import Link from "next/link";
import Header from "../components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Calendar, MessageCircle } from "lucide-react";
import CreateGroupModal from "../components/GroupModal";

interface Group {
    id: number;
    title: string;
    description: string;
    creator_name: string;
    created_at: string;
    memberCount?: number;
}

export default function GroupsPage() {
    const cookies = useCookies();
    const [groups, setGroups] = useState<Group[]>([]);
    const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        async function fetchGroups() {
            try {
                const response = await fetch("http://localhost:8080/api/groups", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${cookies.get("jwt")}`,
                    },
                });
                if (!response.ok) throw new Error("Erreur lors de la récupération des groupes");
                const allGroups = await response.json();
                
                // S'assurer que allGroups est un tableau
                const safeGroups = Array.isArray(allGroups) ? allGroups : [];
                setGroups(safeGroups);
                setFilteredGroups(safeGroups);
            } catch (error) {
                console.error("Erreur de chargement des groupes:", error);
                // En cas d'erreur, définir des tableaux vides
                setGroups([]);
                setFilteredGroups([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchGroups();
    }, [cookies]);

    useEffect(() => {
        // S'assurer que groups est un tableau valide avant de filtrer
        if (Array.isArray(groups)) {
            const filtered = groups.filter(group =>
                group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredGroups(filtered);
        } else {
            setFilteredGroups([]);
        }
    }, [searchQuery, groups]);

    const handleSubmitGroup = async (groupData: { title: string; description: string }) => {
        try {
            const response = await fetch('http://localhost:8080/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookies.get("jwt")}`
                },
                body: JSON.stringify({
                    title: groupData.title,
                    description: groupData.description
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create group: ${errorText}`);
            }

            const newGroup = await response.json();
            setGroups([newGroup, ...groups]);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Erreur lors de la création du groupe');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950">
            <Header username={cookies.get("user")} notifications={[]} showNotifications={false} onToggleNotifications={() => {}} />
            
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Groups</h1>
                        <p className="text-zinc-400 mt-1">Discover and join communities</p>
                    </div>
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus size={20} className="mr-2" />
                        Create Group
                    </Button>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-zinc-900 border-zinc-800"
                        />
                    </div>
                </div>

                {/* Groups Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : !Array.isArray(filteredGroups) || filteredGroups.length === 0 ? (
                    <div className="text-center py-12">
                        <Users size={64} className="mx-auto text-zinc-600 mb-4" />
                        <h3 className="text-xl font-medium text-zinc-300 mb-2">
                            {searchQuery ? "No groups found" : "No groups yet"}
                        </h3>
                        <p className="text-zinc-500 mb-6">
                            {searchQuery 
                                ? "Try a different search term" 
                                : "Be the first to create a group and start building your community!"
                            }
                        </p>
                        {!searchQuery && (
                            <Button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus size={20} className="mr-2" />
                                Create Your First Group
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.isArray(filteredGroups) && filteredGroups.map((group) => (
                            <Link key={group.id} href={`/groups/${group.id}`}>
                                <Card className="h-full hover:bg-zinc-800 transition-colors cursor-pointer border-zinc-800 bg-zinc-900">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-white text-lg mb-2 line-clamp-2">
                                                    {group.title}
                                                </CardTitle>
                                                <CardDescription className="text-zinc-400 line-clamp-3">
                                                    {group.description}
                                                </CardDescription>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center ml-3">
                                                <Users size={24} className="text-white" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between text-sm text-zinc-500">
                                            <span>By {group.creator_name}</span>
                                            <div className="flex items-center space-x-4">
                                                {group.memberCount && (
                                                    <span className="flex items-center">
                                                        <Users size={14} className="mr-1" />
                                                        {group.memberCount}
                                                    </span>
                                                )}
                                                <span>
                                                    {new Date(group.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleSubmitGroup}
            />
        </div>
    );
}
