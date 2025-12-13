import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  modals: {
    isOpen: false,
    type: null,
    data: null
  },
  loading: {
    global: false,
    operations: {}
  },
  sidebarOpen: true,
  searchQuery: ''
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.modals.isOpen = true;
      state.modals.type = action.payload.type;
      state.modals.data = action.payload.data || null;
    },
    closeModal: (state) => {
      state.modals.isOpen = false;
      state.modals.type = null;
      state.modals.data = null;
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setOperationLoading: (state, action) => {
      const { operation, loading } = action.payload;
      state.loading.operations[operation] = loading;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  }
});

export const {
  openModal,
  closeModal,
  setGlobalLoading,
  setOperationLoading,
  toggleSidebar,
  setSidebarOpen,
  setSearchQuery
} = uiSlice.actions;

export default uiSlice.reducer;

