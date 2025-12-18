import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { addTask, updateTask } from "@/services/taskService";
import { parseTaskText } from "@/services/aiService";

let DateTimePicker: any = null;
try {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
} catch (e) {
  // DateTimePicker not available, will show fallback
}

const DEFAULT_PRIORITY: "low" | "medium" | "high" = "medium";
const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180, 240];

export default function AddTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    DEFAULT_PRIORITY
  );
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const newDate = new Date(deadline);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDeadline(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (selectedDate) {
      const newDate = new Date(deadline);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      setDeadline(newDate);
    }
  };

  const handleAIParse = async () => {
    if (!aiInput.trim()) {
      Alert.alert("Error", "Please enter a task description");
      return;
    }

    setLoading(true);
    try {
      const parsed = await parseTaskText(aiInput);
      setTitle(parsed.title);
      setDescription(parsed.description || "");
      setDuration(parsed.duration);
      setPriority(parsed.priority);
      setDeadline(new Date(parsed.deadline));
      setAiInput("");
      setUseAI(false);
      Alert.alert("Success", "Task parsed successfully!");
    } catch (error: any) {
      console.error("AI Parse Error:", error);
      Alert.alert(
        "AI Parser Error",
        error.message || "Failed to parse task. Using fallback."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title,
        description: description || undefined,
        duration,
        deadline: deadline.toISOString(),
        priority,
      };

      if (params.taskId) {
        await updateTask(params.taskId as string, taskData);
      } else {
        const result = await addTask(taskData);
        if (!result) {
          throw new Error(
            "Failed to save task - please ensure you are logged in"
          );
        }
      }

      Alert.alert("Success", "Task saved!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Save Error:", error);
      Alert.alert("Error", error.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#FFFFFF" : "#FFFFFF" },
      ]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? "#000" : "#000" }]}>
          Add Task
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.aiToggleSection}>
          <Text style={[styles.label, { color: isDark ? "#000" : "#000" }]}>
            Use AI to parse task
          </Text>
          <Switch value={useAI} onValueChange={setUseAI} />
        </View>

        {useAI ? (
          <View style={styles.aiInputSection}>
            <TextInput
              style={[
                styles.aiInput,
                {
                  backgroundColor: isDark ? "#2a2a2a" : "#f5f5f5",
                  color: isDark ? "#fff" : "#000",
                  borderColor: isDark ? "#444" : "#ddd",
                },
              ]}
              placeholder="e.g., Study Math for 2 hours tomorrow evening"
              placeholderTextColor={isDark ? "#888" : "#999"}
              value={aiInput}
              onChangeText={setAiInput}
              editable={!loading}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[styles.aiButton, loading && styles.buttonDisabled]}
              onPress={handleAIParse}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.aiButtonText}>Parse with AI</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View>
              <Text style={[styles.label, { color: isDark ? "#000" : "#000" }]}>
                Task Title
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#2a2a2a" : "#F9FAFB",
                    color: isDark ? "#fff" : "#000",
                    borderColor: isDark ? "#374151" : "#e5e7eb",
                  },
                ]}
                placeholder="Enter task title"
                placeholderTextColor={isDark ? "#888" : "#999"}
                value={title}
                onChangeText={setTitle}
                editable={!loading}
              />
            </View>

            <View>
              <Text style={[styles.label, { color: isDark ? "#000" : "#000" }]}>
                Description (optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#2a2a2a" : "#F9FAFB",
                    color: isDark ? "#fff" : "#000",
                    borderColor: isDark ? "#374151" : "#e5e7eb",
                  },
                ]}
                placeholder="Add details"
                placeholderTextColor={isDark ? "#888" : "#999"}
                value={description}
                onChangeText={setDescription}
                editable={!loading}
                multiline
                numberOfLines={3}
              />
            </View>

            <View>
              <Text style={[styles.label, { color: isDark ? "#000" : "#000" }]}>
                Priority
              </Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    backgroundColor: isDark ? "#2a2a2a" : "#F9FAFB",
                    borderColor: isDark ? "#374151" : "#e5e7eb",
                  },
                ]}
              >
                <Picker
                  selectedValue={priority}
                  onValueChange={(itemValue: string) =>
                    setPriority(itemValue as "low" | "medium" | "high")
                  }
                  style={[styles.picker, { color: isDark ? "#fff" : "#000" }]}
                >
                  <Picker.Item label="Low" value={"low" as string} />
                  <Picker.Item label="Medium" value={"medium" as string} />
                  <Picker.Item label="High" value={"high" as string} />
                </Picker>
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: isDark ? "#000" : "#000" }]}>
                Duration: {duration} minutes
              </Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    backgroundColor: isDark ? "#2a2a2a" : "#F9FAFB",
                    borderColor: isDark ? "#374151" : "#e5e7eb",
                  },
                ]}
              >
                <Picker
                  selectedValue={duration}
                  onValueChange={(itemValue: number) => setDuration(itemValue)}
                  style={[styles.picker, { color: isDark ? "#fff" : "#000" }]}
                >
                  {DURATION_OPTIONS.map((opt: number) => (
                    <Picker.Item
                      key={opt}
                      label={`${opt} minutes`}
                      value={opt as number}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: isDark ? "#000" : "#000" }]}>
                Deadline
              </Text>
              <View
                style={[
                  styles.deadlineCard,
                  { backgroundColor: isDark ? "#2a2a2a" : "#FFFFFF" },
                ]}
              >
                <Text
                  style={[
                    styles.deadlineText,
                    { color: isDark ? "#fff" : "#000" },
                  ]}
                >
                  {deadline.toLocaleString()}
                </Text>
              </View>
              {DateTimePicker && (
                <>
                  {showDatePicker && (
                    <DateTimePicker
                      value={deadline}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}
                  {showTimePicker && (
                    <DateTimePicker
                      value={deadline}
                      mode="time"
                      display="default"
                      onChange={handleTimeChange}
                    />
                  )}
                  {!showDatePicker && !showTimePicker && (
                    <View style={styles.dateTimeButtons}>
                      <TouchableOpacity
                        style={[
                          styles.dateTimeButton,
                          { backgroundColor: isDark ? "#2a2a2a" : "#FFFFFF" },
                        ]}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text
                          style={[
                            styles.dateTimeButtonText,
                            { color: isDark ? "#fff" : "#000" },
                          ]}
                        >
                          📅 Date
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.dateTimeButton,
                          { backgroundColor: isDark ? "#2a2a2a" : "#FFFFFF" },
                        ]}
                        onPress={() => setShowTimePicker(true)}
                      >
                        <Text
                          style={[
                            styles.dateTimeButtonText,
                            { color: isDark ? "#fff" : "#000" },
                          ]}
                        >
                          🕐 Time
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Task</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    color: "#007AFF",
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  section: {
    gap: 20,
    marginBottom: 20,
  },
  aiToggleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiInputSection: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  aiInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlignVertical: "top",
  },
  aiButton: {
    backgroundColor: "#00C26F",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  aiButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  priorityButtonActive: {
    borderColor: "#0066CC",
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  picker: {
    height: 50,
  },
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  durationButton: {
    flex: 0.3,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  durationButtonActive: {
    borderColor: "#0066CC",
  },
  durationButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  deadlineCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  deadlineText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dateTimeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
  },
  dateTimeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#0066CC",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
