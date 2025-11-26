import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  crops: [],
  selectedCrop: null,
  loading: false,
  error: null,
  filters: {
    category: '',
    season: '',
    search: ''
  }
};

const cropSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    setCrops: (state, action) => {
      state.crops = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedCrop: (state, action) => {
      state.selectedCrop = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    addCrop: (state, action) => {
      state.crops.push(action.payload);
    },
    updateCrop: (state, action) => {
      const index = state.crops.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.crops[index] = action.payload;
      }
    },
    removeCrop: (state, action) => {
      state.crops = state.crops.filter(c => c.id !== action.payload);
    }
  }
});

export const {
  setCrops,
  setSelectedCrop,
  setLoading,
  setError,
  setFilters,
  clearFilters,
  addCrop,
  updateCrop,
  removeCrop
} = cropSlice.actions;

export default cropSlice.reducer;
