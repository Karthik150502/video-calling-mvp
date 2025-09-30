import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Participant {
    id: string
    stream?: MediaStream
    connectionState: RTCPeerConnectionState,
    videoEnabled?: boolean,
    audioEnabled?: boolean
}

const initialState: Map<string, Participant> = new Map<string, Participant>();


const participantsSlice = createSlice({
    name: 'participants',
    initialState,
    reducers: {
        addParticipant: (state, action: PayloadAction<{ id: string, participant: Participant }>) => {
            state.set(action.payload.id, action.payload.participant);
        },
        removeParticipant: (state, action: PayloadAction<string>) => {
            state.delete(action.payload)
        }
    },
});

export const { addParticipant, removeParticipant } = participantsSlice.actions;
export default participantsSlice.reducer;
