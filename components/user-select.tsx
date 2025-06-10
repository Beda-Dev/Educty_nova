"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useSchoolStore } from "@/store"
import { User } from "@/lib/interface"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchUsers } from "@/store/schoolservice"

interface UserSelectProps {
  value?: string
  onUserSelect: (userId: number | null, userName: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function UserSelect({
  value,
  onUserSelect,
  placeholder = "Sélectionner un utilisateur",
  className,
  disabled = false,
}: UserSelectProps) {
  const { users , setUsers } = useSchoolStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    if (value && users.length > 0) {
      const user = users.find(u => u.id === Number(value))
      setSelectedUser(user || null)
    }
  }, [value, users])

  useEffect(() => {
    if (open && users.length === 0) {
      setLoading(true)
      fetchUsers().then((data) => {
        setUsers(data)
      }).finally(() => setLoading(false))
    }
  }, [open, users.length])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    onUserSelect(user.id, user.name)
    setOpen(false)
    setSearchQuery("")
  }

  const handleClear = () => {
    setSelectedUser(null)
    onUserSelect(null, "")
    setSearchQuery("")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (roleName: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      teacher: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      cashier: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      director: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      secretary: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
    return colors[roleName.toLowerCase()] || colors.default
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-auto min-h-[40px] p-2 hover:bg-accent/20",
              "transition-colors duration-200",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              {selectedUser ? (
                <>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={selectedUser.avatar || undefined} />
                    <AvatarFallback className="text-xs font-medium">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="font-medium truncate max-w-[180px]">
                      {selectedUser.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {selectedUser.email}
                    </span>
                  </div>
                  <div className="hidden md:flex gap-1 ml-auto flex-shrink-0">
                    {selectedUser.roles.slice(0, 2).map((role) => (
                      <Badge 
                        key={role.id} 
                        color="secondary"
                        className={cn(
                          "text-xs px-1.5 py-0.5",
                          getRoleColor(role.name)
                        )}
                      >
                        {role.name}
                      </Badge>
                    ))}
                    {selectedUser.roles.length > 2 && (
                      <Badge color="secondary" className="text-xs px-1.5 py-0.5">
                        +{selectedUser.roles.length - 2}
                      </Badge>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground truncate">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-1 ml-2">
              {selectedUser && !disabled && (
                <X 
                  className="h-4 w-4 opacity-70 hover:opacity-100" 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                />
              )}
              <ChevronDown className={cn(
                "h-4 w-4 shrink-0 opacity-50 transition-transform",
                open && "rotate-180"
              )} />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0" 
          align="start"
          sideOffset={4}
        >
          <Command className="rounded-lg border shadow-md">
            <div className="flex items-center border-b px-3 py-2 bg-accent/50">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-70" />
              <CommandInput
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="border-0 focus:ring-0 h-auto py-1 text-sm"
              />
            </div>
            
            <CommandList>
              <ScrollArea className="max-h-[300px]">
                {loading ? (
                  <div className="space-y-2 p-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 p-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-[120px]" />
                          <Skeleton className="h-3 w-[80px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {selectedUser && (
                      <CommandGroup className="border-b">
                        <CommandItem 
                          onSelect={handleClear}
                          className="cursor-pointer text-destructive hover:bg-destructive/5"
                        >
                          <div className="flex items-center gap-2">
                            <X className="h-4 w-4" />
                            <span>Effacer la sélection</span>
                          </div>
                        </CommandItem>
                      </CommandGroup>
                    )}

                    <CommandGroup heading="Utilisateurs disponibles">
                      {filteredUsers.length === 0 ? (
                        <CommandEmpty className="py-4 text-sm text-center text-muted-foreground">
                          Aucun utilisateur trouvé
                        </CommandEmpty>
                      ) : (
                        filteredUsers.map((user) => (
                          <CommandItem 
                            key={user.id} 
                            onSelect={() => handleUserSelect(user)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              "aria-selected:bg-accent/50"
                            )}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={user.avatar || undefined} />
                                <AvatarFallback className="text-xs font-medium">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium truncate">{user.name}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {user.email}
                                </span>
                              </div>
                              <div className="hidden md:flex gap-1 flex-shrink-0">
                                {user.roles.slice(0, 1).map((role) => (
                                  <Badge
                                    key={role.id}
                                    color="secondary"
                                    className={cn(
                                      "text-xs px-1.5 py-0.5",
                                      getRoleColor(role.name)
                                    )}
                                  >
                                    {role.name}
                                  </Badge>
                                ))}
                                {user.roles.length > 1 && (
                                  <Badge color="secondary" className="text-xs px-1.5 py-0.5">
                                    +{user.roles.length - 1}
                                  </Badge>
                                )}
                              </div>
                              {selectedUser?.id === user.id && (
                                <Check className="ml-2 h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </>
                )}
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}