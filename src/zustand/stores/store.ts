import { Participant } from '@/types/call'
import { create } from 'zustand';
import { PersistStorage, persist, StateStorage, StorageValue } from 'zustand/middleware';

export type Participants = Map<string, Participant>;

type Store = {
    participants: Participants,
    currentMeetingId: string | null,
    addParticipant: (participant: Participant) => void,
    deleteParticipant: (participantId: string) => void,
    setParticipants: (payload: Map<string, Participant> | ((prev: Map<string, Participant>) => Map<string, Participant>)) => void,
    setCurrentMeetingId: (payload: string | null) => void,
}


type StoreStateType = {
    participants: [string, Participant][],
    currentMeetingId: string
}

const customStorage: PersistStorage<StoreStateType, void> = {
    getItem: (name: string) => {
        const str = localStorage.getItem(name)
        if (!str) return null

        let parsed
        try {
            parsed = JSON.parse(str)
        } catch (err) {
            console.error("Error parsing persisted state:", err)
            return null
        }

        // ✅ Only rehydrate Map if it exists
        if (parsed?.state?.participants) {
            parsed.state.participants = new Map(parsed.state.participants)
        }

        return parsed
    },

    setItem: (name: string, value: StorageValue<StoreStateType>) => {
        if (!value) {
            console.warn("Skipping persist: value missing");
            return;
        }

        const state = value.state ?? value; // Zustand passes { state, version }

        if (!state.participants) {
            console.warn("Skipping persist: participants missing", value);
            return;
        }

        // ✅ Convert Map → Array before saving
        const cloned = {
            ...value,
            state: {
                ...state,
                participants: Array.from(state.participants.entries?.() ?? []),
            },
        };
        localStorage.setItem(name, JSON.stringify(cloned));
    },
    removeItem: (name: string) => localStorage.removeItem(name),
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
            storage: customStorage
        },

    )
)


export default useStore;