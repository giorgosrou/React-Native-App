import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";

export default function VoiceRecorder() {
    const [recording, setRecording] = useState(null);
    const [recordingStatus, setRecordingStatus] = useState("idle");
    const [audioPermission, setAudioPermission] = useState(null);
    const [decibelLevel, setDecibelLevel] = useState(0);
    const threshold = -10; // Set your desired threshold here

    useEffect(() => {
        // Simply get recording permission upon first render
        async function getPermission() {
            try {
                const { status } = await Audio.requestPermissionsAsync();
                console.log("Permission Granted: " + (status === "granted"));
                setAudioPermission(status === "granted");
            } catch (error) {
                console.log(error);
            }
        }

        // Call function to get permission
        getPermission();
    }, []);

    useEffect(() => {
        if (recording) {
            recording.setOnRecordingStatusUpdate(status => {
                if (status.isRecording) {
                    setRecordingStatus("recording");
                    const decibels = calculateDecibelLevel(status);
                    setDecibelLevel(decibels);
                } else if (!status.isDoneRecording) {
                    setRecordingStatus("paused");
                } else {
                    setRecordingStatus("stopped");
                }
            });
        }
    }, [recording]);

    useEffect(() => {
        if (!recording && decibelLevel >= threshold) {
            startRecording();
        }
    }, [decibelLevel]);

    function calculateDecibelLevel(status) {
        if (!status || typeof status.metering !== 'number' || isNaN(status.metering)) {
            console.log("Invalid status or metering value:", status);
            return 0; // Return 0 or another default value if the status or metering value is invalid
        }

        const decibel = status.metering;
        return decibel;
    }

    function getBackgroundColor(decibelLevel) {
        console.log("Decibel Level:", decibelLevel);
        if (decibelLevel >= 0) {
            return "green";
        } else if (decibelLevel >= -30 && decibelLevel < -10) {
            return "blue";
        } else if (decibelLevel >= -50 && decibelLevel < -30) {
            return "yellow";
        } else if (decibelLevel >= -70 && decibelLevel < -50) {
            return "orange";
        } else {
            return "red";
        }
    }

    async function startRecording() {
        try {
            if (!audioPermission) {
                console.log("Audio recording permission not granted.");
                return;
            }

            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
            await newRecording.startAsync();
            setRecording(newRecording);
        } catch (error) {
            console.error("Failed to start recording", error);
        }
    }

    async function stopRecording() {
        try {
            if (recordingStatus === "recording") {
                await recording.stopAndUnloadAsync();
                setRecording(null);
            }
        } catch (error) {
            console.error("Failed to stop recording", error);
        }
    }

    async function handleRecordButtonPress() {
        if (recording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor(decibelLevel) },
            ]}
        >
            <TouchableOpacity
                style={styles.button}
                onPress={handleRecordButtonPress}
            >
                <FontAwesome
                    name={recording ? "stop-circle" : "circle"}
                    size={64}
                    color="white"
                />
            </TouchableOpacity>
            <Text style={styles.recordingStatusText}>
                {`Recording status: ${recordingStatus}`}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    button: {
        alignItems: "center",
        justifyContent: "center",
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: "red",
    },
    recordingStatusText: {
        marginTop: 16,
    },
});
