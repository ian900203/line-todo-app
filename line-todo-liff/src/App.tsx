"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  CalendarIcon,
  Plus,
  Trash2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Edit3,
  List,
  CalendarIcon as CalendarViewIcon,
} from "lucide-react"
import { format, addDays, subDays, isToday, isYesterday, isTomorrow } from "date-fns"
import { zhTW } from "date-fns/locale"

interface Task {
  id: string
  content: string
  category: string
  completed: boolean
  date: string
}

const categories = [
  { value: "work", label: "工作", color: "bg-blue-500" },
  { value: "study", label: "學習", color: "bg-green-500" },
  { value: "life", label: "生活", color: "bg-purple-500" },
  { value: "health", label: "健康", color: "bg-red-500" },
  { value: "hobby", label: "興趣", color: "bg-orange-500" },
]

export default function TodoApp() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskContent, setNewTaskContent] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState("")
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [user] = useState({ name: "LINE 使用者", profileImage: "/placeholder.svg?height=32&width=32" })
  const [currentView, setCurrentView] = useState<"list" | "calendar">("list")

  // Mock LINE Login status
  const [isLoggedIn] = useState(true)

  const dateString = format(selectedDate, "yyyy-MM-dd")
  const todayTasks = tasks.filter((task) => task.date === dateString)

  const addTask = () => {
    if (newTaskContent.trim() && newTaskCategory) {
      const newTask: Task = {
        id: Date.now().toString(),
        content: newTaskContent.trim(),
        category: newTaskCategory,
        completed: false,
        date: dateString,
      }
      setTasks([...tasks, newTask])
      setNewTaskContent("")
      setNewTaskCategory("")
    }
  }

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const startEditing = (task: Task) => {
    setEditingTask(task.id)
    setEditContent(task.content)
  }

  const saveEdit = () => {
    if (editContent.trim()) {
      setTasks(tasks.map((task) => (task.id === editingTask ? { ...task, content: editContent.trim() } : task)))
    }
    setEditingTask(null)
    setEditContent("")
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setEditContent("")
  }

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "今日"
    if (isYesterday(date)) return "昨日"
    if (isTomorrow(date)) return "明日"
    return format(date, "MM/dd", { locale: zhTW })
  }

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find((cat) => cat.value === categoryValue) || categories[0]
  }

  const getTasksForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return tasks.filter((task) => task.date === dateStr)
  }

  const getTaskCountForDate = (date: Date) => {
    return getTasksForDate(date).length
  }

  const getCompletedTasksForDate = (date: Date) => {
    return getTasksForDate(date).filter((task) => task.completed).length
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">LINE 待辦清單</h1>
            <p className="text-gray-600 mb-6">請先登入 LINE 帳號</p>
            <Button className="w-full bg-green-500 hover:bg-green-600">LINE 登入</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={user.profileImage || "/placeholder.svg"} alt="Profile" className="w-8 h-8 rounded-full" />
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{format(selectedDate, "yyyy/MM/dd")}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={currentView === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("list")}
                  className="h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={currentView === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentView("calendar")}
                  className="h-8 px-3"
                >
                  <CalendarViewIcon className="w-4 h-4" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-500">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {currentView === "list" ? (
          <>
            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
              <Button variant="ghost" size="sm" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center space-x-2">
                <span className="font-medium">{getDateLabel(selectedDate)}</span>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <CalendarIcon className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) {
                          setSelectedDate(date)
                          setCalendarOpen(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Add Task Section */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="輸入待辦事項"
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                />
                <div className="flex space-x-2">
                  <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="選擇分類" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${category.color}`} />
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addTask} disabled={!newTaskContent.trim() || !newTaskCategory}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <div className="space-y-2">
              <h2 className="font-medium text-gray-700 px-1">
                {getDateLabel(selectedDate)}任務 ({todayTasks.length})
              </h2>

              {todayTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    <p>今天還沒有任務</p>
                    <p className="text-sm">新增一個任務開始吧！</p>
                  </CardContent>
                </Card>
              ) : (
                todayTasks.map((task) => (
                  <Card key={task.id} className={task.completed ? "opacity-60" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />

                        <div className="flex-1 min-w-0">
                          {editingTask === task.id ? (
                            <div className="flex space-x-2">
                              <Input
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit()
                                  if (e.key === "Escape") cancelEdit()
                                }}
                                className="flex-1"
                                autoFocus
                              />
                              <Button size="sm" onClick={saveEdit}>
                                保存
                              </Button>
                            </div>
                          ) : (
                            <div
                              className={`cursor-pointer ${task.completed ? "line-through" : ""}`}
                              onClick={() => startEditing(task)}
                            >
                              <p className="font-medium">{task.content}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge
                                  variant="secondary"
                                  className={`text-white ${getCategoryInfo(task.category).color}`}
                                >
                                  {getCategoryInfo(task.category).label}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-1">
                          {editingTask !== task.id && (
                            <Button variant="ghost" size="sm" onClick={() => startEditing(task)}>
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Stats */}
            {todayTasks.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>完成進度</span>
                    <span>
                      {todayTasks.filter((t) => t.completed).length} / {todayTasks.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(todayTasks.filter((t) => t.completed).length / todayTasks.length) * 100}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* Calendar View */
          <div className="space-y-4">
            {/* Calendar Header */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate(subDays(selectedDate, 30))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="font-semibold text-lg">{format(selectedDate, "yyyy年 MM月", { locale: zhTW })}</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDate(addDays(selectedDate, 30))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 42 }, (_, i) => {
                    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
                    const startOfWeek = subDays(startOfMonth, startOfMonth.getDay())
                    const currentDate = addDays(startOfWeek, i)
                    const isCurrentMonth = currentDate.getMonth() === selectedDate.getMonth()
                    const isSelected = format(currentDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
                    const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                    const taskCount = getTaskCountForDate(currentDate)
                    const completedCount = getCompletedTasksForDate(currentDate)

                    return (
                      <div
                        key={i}
                        className={`
                        relative aspect-square flex flex-col items-center justify-center text-sm cursor-pointer rounded-lg transition-colors
                        ${isCurrentMonth ? "text-gray-900" : "text-gray-300"}
                        ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-100"}
                        ${isToday && !isSelected ? "bg-blue-50 text-blue-600 font-semibold" : ""}
                      `}
                        onClick={() => {
                          setSelectedDate(currentDate)
                          setCurrentView("list")
                        }}
                      >
                        <span className="text-xs">{format(currentDate, "d")}</span>
                        {taskCount > 0 && (
                          <div className="flex space-x-1 mt-1">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                completedCount === taskCount ? "bg-green-400" : "bg-orange-400"
                              } ${isSelected ? "bg-white" : ""}`}
                            />
                            {taskCount > 1 && (
                              <span className={`text-xs ${isSelected ? "text-white" : "text-gray-600"}`}>
                                {taskCount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected Date Tasks Preview */}
            {todayTasks.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-3">
                    {getDateLabel(selectedDate)} ({todayTasks.length} 個任務)
                  </h3>
                  <div className="space-y-2">
                    {todayTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center space-x-2 text-sm">
                        <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
                        <span className={task.completed ? "line-through text-gray-500" : ""}>{task.content}</span>
                        <Badge
                          variant="secondary"
                          className={`text-white ${getCategoryInfo(task.category).color} text-xs`}
                        >
                          {getCategoryInfo(task.category).label}
                        </Badge>
                      </div>
                    ))}
                    {todayTasks.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-600"
                        onClick={() => setCurrentView("list")}
                      >
                        查看全部 {todayTasks.length} 個任務
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Calendar Legend */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 text-sm">圖例</h4>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    <span>有未完成任務</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span>任務全部完成</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
