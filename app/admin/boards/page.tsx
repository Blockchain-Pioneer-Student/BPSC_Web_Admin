"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Folders,
  Save,
  Loader2
} from "lucide-react";
import { boardService, type Board, type CreateBoardData, type UpdateBoardData } from "@/lib/services/boardService";
import { toast } from "sonner";

export default function AdminBoardsPage() {
  // Data state
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    display_order: 1000,
    is_visible: true,
  });

  // Fetch boards
  const fetchBoards = async () => {
    try {
      setLoading(true);
      const data = await boardService.getAllBoards();
      setBoards(data);
    } catch (error) {
      console.error("Error fetching boards:", error);
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // Filter boards based on search
  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (board.description && board.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      display_order: 1000,
      is_visible: true,
    });
    setSelectedBoard(null);
  };

  // Handle create board
  const handleCreate = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  // Handle edit board
  const handleEdit = (board: Board) => {
    setSelectedBoard(board);
    setFormData({
      name: board.name,
      description: board.description || "",
      display_order: board.display_order > 0 ? board.display_order : 1000,
      is_visible: board.is_visible ?? true,
    });
    setEditDialogOpen(true);
  };

  // Submit create form
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Board name is required");
      return;
    }

    try {
      setFormLoading(true);
      
      const createData: CreateBoardData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        display_order: formData.display_order,
        is_visible: formData.is_visible,
      };

      await boardService.createBoard(createData);
      toast.success("Board created successfully!");
      
      setCreateDialogOpen(false);
      resetForm();
      fetchBoards();
    } catch (error: any) {
      console.error("Error creating board:", error);
      toast.error(error.message || "Failed to create board");
    } finally {
      setFormLoading(false);
    }
  };

  // Submit edit form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBoard || !formData.name.trim()) {
      toast.error("Board name is required");
      return;
    }

    try {
      setFormLoading(true);
      
      const updateData: UpdateBoardData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        display_order: formData.display_order,
        is_visible: formData.is_visible,
      };

      await boardService.updateBoard(selectedBoard.id, updateData);
      toast.success("Board updated successfully!");
      
      setEditDialogOpen(false);
      resetForm();
      fetchBoards();
    } catch (error: any) {
      console.error("Error updating board:", error);
      toast.error(error.message || "Failed to update board");
    } finally {
      setFormLoading(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!selectedBoard) return;

    try {
      await boardService.deleteBoard(selectedBoard.id);
      toast.success("Board deleted successfully!");
      
      setSelectedBoard(null);
      fetchBoards();
    } catch (error: any) {
      console.error("Error deleting board:", error);
      toast.error(error.message || "Failed to delete board");
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Folders className="h-6 w-6" />
              Boards Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage organization boards and departments
            </p>
          </div>
          
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Board
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-4 mt-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Boards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredBoards.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Folders className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              {searchQuery ? "No boards found" : "No boards yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Create your first board to get started"
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleCreate} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Board
              </Button>
            )}
          </div>
        ) : (
          filteredBoards.map((board) => (
            <Card key={board.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{board.name}</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge variant="outline">ID: {board.id}</Badge>
                      <Badge variant="outline">Order: {board.display_order ?? 0}</Badge>
                      {!board.is_visible && <Badge variant="secondary">Hidden</Badge>}
                    </div>
                  </div>
                </CardTitle>
                {board.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {board.description}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(board)}
                    className="gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setSelectedBoard(board)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Board</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &ldquo;<strong>{board.name}</strong>&rdquo;? 
                          This action cannot be undone and may affect members assigned to this board.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteConfirm}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Board
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Board Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Board
            </DialogTitle>
            <DialogDescription>
              Add a new board to organize your team members and structure.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">
                  Board Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter board name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Textarea
                  id="create-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter board description (optional)"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-order">Display order</Label>
                <Input
                  id="create-order"
                  type="number"
                  min={1}
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="create-visible">Visible on public site</Label>
                <Switch
                  id="create-visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading} className="gap-2">
                {formLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {formLoading ? "Creating..." : "Create Board"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Board Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Board
            </DialogTitle>
            <DialogDescription>
              Update the board information and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">
                  Board Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter board name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter board description (optional)"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-order">Display order</Label>
                <Input
                  id="edit-order"
                  type="number"
                  min={1}
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="edit-visible">Visible on public site</Label>
                <Switch
                  id="edit-visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading} className="gap-2">
                {formLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {formLoading ? "Updating..." : "Update Board"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
