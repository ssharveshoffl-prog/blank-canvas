import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Entry, getEntries, updateEntryPositions } from '@/lib/entries';
import { useAuth } from '@/contexts/AuthContext';
import { EntryView } from '@/components/EntryView';
import { CreateEntryModal } from '@/components/CreateEntryModal';
import { DraggableEntryCard } from '@/components/DraggableEntryCard';
import { GalleryPage } from '@/components/gallery/GalleryPage';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, LogOut, BookOpen, Loader2, Images } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfinityMark } from '@/components/InfinityMark';

type PageView = 'entries' | 'gallery';

export function MainPage() {
  const { user, logout } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageView, setPageView] = useState<PageView>('entries');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadEntries = async () => {
    const data = await getEntries();
    setEntries(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = entries.findIndex((e) => e.id === active.id);
      const newIndex = entries.findIndex((e) => e.id === over.id);

      const newEntries = arrayMove(entries, oldIndex, newIndex);
      setEntries(newEntries);

      // Update positions in database
      const updates = newEntries.map((entry, index) => ({
        id: entry.id,
        position: index,
      }));
      await updateEntryPositions(updates);
    }
  };

  const handleEntryClick = (entry: Entry) => {
    setSelectedEntryId(entry.id);
  };

  const handleCloseEntry = () => {
    setSelectedEntryId(null);
  };

  const handleEntryUpdate = () => {
    loadEntries();
  };

  const handleEntryDelete = () => {
    setSelectedEntryId(null);
    loadEntries();
  };

  const handleCreateEntry = () => {
    loadEntries();
  };

  if (pageView === 'gallery') {
    return <GalleryPage onClose={() => setPageView('entries')} />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "w-80 shrink-0 border-r border-border/50 flex flex-col bg-card/30",
        "hidden md:flex",
        selectedEntryId && "md:flex"
      )}>
        {/* Sidebar Header */}
        <header className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-serif text-xl font-light text-foreground flex items-center gap-2">
              <InfinityMark className="w-8 h-4 animate-infinity-breathe" tone="pink" />
              Our Infinity
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2 mb-3">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className={cn(
                "flex-1 h-10 font-sans text-sm",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "transition-gentle"
              )}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPageView('gallery')}
              className="h-10 w-10"
              title="Photo Gallery"
            >
              <Images className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Entries List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No entries yet</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={entries.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {entries.map((entry) => (
                      <DraggableEntryCard
                        key={entry.id}
                        entry={entry}
                        isSelected={selectedEntryId === entry.id}
                        onClick={() => handleEntryClick(entry)}
                        variant="sidebar"
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground font-sans">
            Logged in as <span className="text-foreground">{user?.username}</span>
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar (when no entry selected) */}
      {!selectedEntryId && (
        <aside className="flex-1 flex flex-col md:hidden">
          {/* Mobile Header */}
          <header className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-serif text-xl font-light text-foreground flex items-center gap-2">
                <InfinityMark className="w-8 h-4 animate-infinity-breathe" tone="pink" />
                Our Little Infinity
              </h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPageView('gallery')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Images className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className={cn(
                "w-full h-12 font-sans",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "transition-gentle"
              )}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </header>

          {/* Mobile Entries List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-16">
                  <InfinityMark className="w-20 h-10 mx-auto mb-4 animate-infinity-breathe" tone="pink" />
                  <h2 className="font-serif text-xl text-foreground mb-2">
                    Your infinity awaits
                  </h2>
                  <p className="font-sans text-sm text-muted-foreground">
                    Create your first entry to begin
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={entries.map((e) => e.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {entries.map((entry) => (
                        <DraggableEntryCard
                          key={entry.id}
                          entry={entry}
                          isSelected={false}
                          onClick={() => handleEntryClick(entry)}
                          variant="mobile"
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </ScrollArea>
        </aside>
      )}

      {/* Main Content */}
      {selectedEntryId ? (
        <EntryView
          entryId={selectedEntryId}
          onClose={handleCloseEntry}
          onUpdate={handleEntryUpdate}
          onDelete={handleEntryDelete}
        />
      ) : (
        <main className="hidden md:flex flex-1 items-center justify-center bg-secondary/10">
          <div className="text-center">
            <InfinityMark className="w-24 h-12 mx-auto mb-6 animate-infinity-breathe" tone="pink" />
            <h2 className="font-serif text-2xl text-foreground mb-2">
              Select an Memory
            </h2>
            <p className="font-sans text-muted-foreground">
              to explore
            </p>
          </div>
        </main>
      )}

      {/* Create Entry Modal */}
      <CreateEntryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateEntry}
      />
    </div>
  );
}
