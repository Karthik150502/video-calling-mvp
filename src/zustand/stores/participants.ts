import { Participant } from '@/types'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Participants = Map<string, Participant>;

type Store = {
    participants: Participants,
    currentMeetingId: string | null,
    addParticipant: (participant: Participant) => void,
    deleteParticipant: (participantId: string) => void,
    setParticipants: (payload: Map<string, Participant> | ((prev: Map<string, Participant>) => Map<string, Participant>)) => void,
    setCurrentMeetingId: (payload: string | null) => void,
}

const useStore = create<Store>()(
    persist(
        (set) => ({
            participants: new Map(),
            currentMeetingId: null,
            addParticipant: (participant: Participant) => set((state) => {
                const updated = new Map(state.participants)
                updated.set(participant.id, participant)
                return { ...state, participants: updated }
            }),
            deleteParticipant: (participantId: string) => set((state) => {
                const updated = new Map(state.participants)
                updated.delete(participantId)
                return { ...state, participants: updated }
            }),
            setParticipants: (payload) =>
                set((state) => {
                    const updated =
                        typeof payload === 'function'
                            ? payload(state.participants)
                            : new Map(payload)
                    return { ...state, participants: updated }
                }),
            setCurrentMeetingId: (payload) => set({ currentMeetingId: payload }),
        }),
        {
            name: `debate-io-current-participants`,
            // Only persist `currentMeetingId`, skip `participants`
            partialize: (state) => ({
                currentMeetingId: state.currentMeetingId,
            }),
        },

    )
)


export default useStore;