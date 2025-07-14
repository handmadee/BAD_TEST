"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { teamService } from "@/lib";
import type { TeamPost, TeamMember } from "@/types/api";
import toast from "react-hot-toast";

export default function MyTeamsPage() {
    const [myTeamPosts, setMyTeamPosts] = useState<TeamPost[]>([]);
    const [joinedTeams, setJoinedTeams] = useState<TeamPost[]>([]);
    const [selectedPost, setSelectedPost] = useState<TeamPost | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"created" | "joined">("created");

    // Determine if current user is the owner of selected post
    const isOwner = selectedPost
        ? myTeamPosts.some((post) => post.id === selectedPost.id)
        : false;

    useEffect(() => {
        loadTeamData();
    }, []);

    const loadTeamData = async () => {
        try {
            const [myPostsResponse, joinedResponse] = await Promise.all([
                teamService.getMyTeamPosts({ page: 0, size: 20 }),
                teamService.getJoinedTeams({ page: 0, size: 20 }),
            ]);

            setMyTeamPosts(myPostsResponse.data.content);
            setJoinedTeams(joinedResponse.data.content);

            // Auto-select first team based on active tab
            if (myPostsResponse.data.content.length > 0) {
                setActiveTab("created");
                setSelectedPost(myPostsResponse.data.content[0]);
                loadTeamMembers(myPostsResponse.data.content[0].id);
            } else if (joinedResponse.data.content.length > 0) {
                setActiveTab("joined");
                setSelectedPost(joinedResponse.data.content[0]);
                loadTeamMembers(joinedResponse.data.content[0].id);
            }
        } catch (error) {
            console.error("Error loading team data:", error);
            toast.error("Lỗi tải dữ liệu đội");
        } finally {
            setLoading(false);
        }
    };

    const loadTeamMembers = async (postId: number) => {
        try {
            const response = await teamService.getTeamMembers(postId);
            setMembers(response.data);
        } catch (error) {
            console.error("Error loading team members:", error);
            toast.error("Lỗi tải danh sách thành viên");
        }
    };

    const handleSelectPost = (post: TeamPost) => {
        setSelectedPost(post);
        loadTeamMembers(post.id);
    };

    const handleTabChange = (tab: "created" | "joined") => {
        setActiveTab(tab);
        const posts = tab === "created" ? myTeamPosts : joinedTeams;
        if (posts.length > 0) {
            setSelectedPost(posts[0]);
            loadTeamMembers(posts[0].id);
        } else {
            setSelectedPost(null);
            setMembers([]);
        }
    };

    const handleAcceptMember = async (memberId: number) => {
        if (!selectedPost || !isOwner) return;

        setActionLoading(memberId);
        try {
            await teamService.acceptMember(selectedPost.id, memberId);
            toast.success("Đã chấp nhận thành viên");

            // Cập nhật state local
            setMembers((prev) =>
                prev.map((member) =>
                    member.id === memberId
                        ? { ...member, status: "ACCEPTED" }
                        : member
                )
            );

            // Cập nhật số lượng thành viên trong team post
            const updateTeamPosts = (posts: TeamPost[]) =>
                posts.map((post) =>
                    post.id === selectedPost.id
                        ? {
                              ...post,
                              currentPlayers: post.currentPlayers + 1,
                              isFull:
                                  post.currentPlayers + 1 >= post.maxPlayers,
                          }
                        : post
                );

            setMyTeamPosts(updateTeamPosts);
            setJoinedTeams(updateTeamPosts);

            // Cập nhật selected post
            setSelectedPost((prev) =>
                prev
                    ? {
                          ...prev,
                          currentPlayers: prev.currentPlayers + 1,
                          isFull: prev.currentPlayers + 1 >= prev.maxPlayers,
                      }
                    : null
            );
        } catch (error) {
            console.error("Error accepting member:", error);
            toast.error("Lỗi chấp nhận thành viên");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectMember = async (memberId: number) => {
        if (!selectedPost || !isOwner) return;

        setActionLoading(memberId);
        try {
            await teamService.rejectMember(selectedPost.id, memberId);
            toast.success("Đã từ chối thành viên");

            // Cập nhật state local
            setMembers((prev) =>
                prev.map((member) =>
                    member.id === memberId
                        ? { ...member, status: "REJECTED" }
                        : member
                )
            );
        } catch (error) {
            console.error("Error rejecting member:", error);
            toast.error("Lỗi từ chối thành viên");
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-amber-100 text-amber-800 border-amber-200";
            case "ACCEPTED":
                return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "REJECTED":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "PENDING":
                return "Chờ duyệt";
            case "ACCEPTED":
                return "Đã chấp nhận";
            case "REJECTED":
                return "Đã từ chối";
            default:
                return status;
        }
    };

    const getPostStatusColor = (post: TeamPost) => {
        if (post.isFull) {
            return "bg-blue-100 text-blue-800 border-blue-200";
        }
        if (new Date(post.playDate) < new Date()) {
            return "bg-gray-100 text-gray-800 border-gray-200";
        }
        return "bg-green-100 text-green-800 border-green-200";
    };

    const getPostStatusText = (post: TeamPost) => {
        if (post.isFull) {
            return "Đã đủ người";
        }
        if (new Date(post.playDate) < new Date()) {
            return "Đã quá hạn";
        }
        return "Đang mở";
    };

    const currentTeams = activeTab === "created" ? myTeamPosts : joinedTeams;
    const pendingMembers = members.filter((m) => m.status === "PENDING");
    const acceptedMembers = members.filter((m) => m.status === "ACCEPTED");

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Đội của tôi
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Quản lý các đội bạn đã tạo và tham gia
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => handleTabChange("created")}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === "created"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    Đội đã tạo ({myTeamPosts.length})
                                </button>
                                <button
                                    onClick={() => handleTabChange("joined")}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === "joined"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    }`}
                                >
                                    Đội đã tham gia ({joinedTeams.length})
                                </button>
                            </nav>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Danh sách đội */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {activeTab === "created"
                                        ? "Đội đã tạo"
                                        : "Đội đã tham gia"}{" "}
                                    ({currentTeams.length})
                                </h2>

                                {currentTeams.length === 0 ? (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {activeTab === "created"
                                                ? "Chưa tạo đội nào"
                                                : "Chưa tham gia đội nào"}
                                        </h3>
                                        <p className="text-gray-500">
                                            {activeTab === "created"
                                                ? "Tạo đội đầu tiên để bắt đầu tìm kiếm đồng đội"
                                                : "Tham gia các đội khác để bắt đầu chơi cùng nhau"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {currentTeams.map((post) => (
                                            <div
                                                key={post.id}
                                                onClick={() =>
                                                    handleSelectPost(post)
                                                }
                                                className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all hover:shadow-md ${
                                                    selectedPost?.id === post.id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                                        {post.title}
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getPostStatusColor(
                                                                post
                                                            )}`}
                                                        >
                                                            {getPostStatusText(
                                                                post
                                                            )}
                                                        </span>
                                                        {activeTab ===
                                                            "joined" && (
                                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border-purple-200">
                                                                Thành viên
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                        <span>
                                                            {formatDate(
                                                                post.playDate
                                                            )}{" "}
                                                            •{" "}
                                                            {formatTime(
                                                                post.playDate
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                        </svg>
                                                        <span>
                                                            {post.location}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                                            />
                                                        </svg>
                                                        <span className="font-medium">
                                                            {
                                                                post.currentPlayers
                                                            }
                                                            /{post.maxPlayers}{" "}
                                                            người
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="mt-3">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{
                                                                width: `${
                                                                    (post.currentPlayers /
                                                                        post.maxPlayers) *
                                                                    100
                                                                }%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Chi tiết thành viên */}
                            <div>
                                {selectedPost ? (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                                Thành viên đội:{" "}
                                                {selectedPost.title}
                                            </h2>

                                            {/* Role indicator */}
                                            <div className="mb-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        isOwner
                                                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                                            : "bg-purple-100 text-purple-800 border border-purple-200"
                                                    }`}
                                                >
                                                    {isOwner
                                                        ? "👑 Chủ đội"
                                                        : "👤 Thành viên"}
                                                </span>
                                            </div>

                                            {/* Thống kê */}
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                    <div className="text-2xl font-bold text-amber-600">
                                                        {pendingMembers.length}
                                                    </div>
                                                    <div className="text-sm text-amber-700">
                                                        Chờ duyệt
                                                    </div>
                                                </div>
                                                <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                                    <div className="text-2xl font-bold text-emerald-600">
                                                        {acceptedMembers.length}
                                                    </div>
                                                    <div className="text-sm text-emerald-700">
                                                        Đã tham gia
                                                    </div>
                                                </div>
                                                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {
                                                            selectedPost.maxPlayers
                                                        }
                                                    </div>
                                                    <div className="text-sm text-blue-700">
                                                        Tối đa
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Yêu cầu chờ duyệt - chỉ hiển thị cho chủ đội */}
                                        {isOwner &&
                                            pendingMembers.length > 0 && (
                                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                        <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                                                        Yêu cầu chờ duyệt (
                                                        {pendingMembers.length})
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {pendingMembers.map(
                                                            (member) => (
                                                                <div
                                                                    key={
                                                                        member.id
                                                                    }
                                                                    className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                                                                            <span className="text-amber-700 font-medium text-sm">
                                                                                {member.user?.fullName?.charAt(
                                                                                    0
                                                                                ) ||
                                                                                    "U"}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium text-gray-900">
                                                                                {member
                                                                                    .user
                                                                                    ?.fullName ||
                                                                                    "Người dùng"}
                                                                            </p>
                                                                            <p className="text-sm text-gray-500">
                                                                                Yêu
                                                                                cầu
                                                                                lúc{" "}
                                                                                {formatDate(
                                                                                    member.joinedAt
                                                                                )}{" "}
                                                                                •{" "}
                                                                                {formatTime(
                                                                                    member.joinedAt
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() =>
                                                                                handleAcceptMember(
                                                                                    member.id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                actionLoading ===
                                                                                member.id
                                                                            }
                                                                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            {actionLoading ===
                                                                            member.id
                                                                                ? "..."
                                                                                : "Chấp nhận"}
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleRejectMember(
                                                                                    member.id
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                actionLoading ===
                                                                                member.id
                                                                            }
                                                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            {actionLoading ===
                                                                            member.id
                                                                                ? "..."
                                                                                : "Từ chối"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                        {/* Thành viên đã tham gia */}
                                        {acceptedMembers.length > 0 && (
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <span className="w-3 h-3 bg-emerald-400 rounded-full"></span>
                                                    Thành viên đã tham gia (
                                                    {acceptedMembers.length})
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {acceptedMembers.map(
                                                        (member) => (
                                                            <div
                                                                key={member.id}
                                                                className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                                                            >
                                                                <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
                                                                    <span className="text-emerald-700 font-medium text-sm">
                                                                        {member.user?.fullName?.charAt(
                                                                            0
                                                                        ) ||
                                                                            "U"}
                                                                    </span>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="font-medium text-gray-900 truncate">
                                                                        {member
                                                                            .user
                                                                            ?.fullName ||
                                                                            "Người dùng"}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500 truncate">
                                                                        Tham gia{" "}
                                                                        {formatDate(
                                                                            member.joinedAt
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Thông báo nếu không có thành viên */}
                                        {members.length === 0 && (
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <svg
                                                        className="w-8 h-8 text-gray-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    Chưa có thành viên nào
                                                </h3>
                                                <p className="text-gray-500">
                                                    Đội này chưa có ai yêu cầu
                                                    tham gia
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Chọn một đội
                                        </h3>
                                        <p className="text-gray-500">
                                            Nhấp vào một đội bên trái để xem chi
                                            tiết thành viên
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
