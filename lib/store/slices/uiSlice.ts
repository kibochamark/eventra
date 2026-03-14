import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  stockMovementSheet: { open: boolean; assetId: string | null };
  addAssetDialog: boolean;
  addCategoryDialog: boolean;
  clientSheet: { open: boolean; clientId: string | null };
  addQuoteItemSheet: { open: boolean; quoteId: string | null };
  userDrawer: { open: boolean; userId: string | null };
}

const initialState: UIState = {
  stockMovementSheet: { open: false, assetId: null },
  addAssetDialog: false,
  addCategoryDialog: false,
  clientSheet: { open: false, clientId: null },
  addQuoteItemSheet: { open: false, quoteId: null },
  userDrawer: { open: false, userId: null },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openStockMovementSheet(state, action: PayloadAction<string>) {
      state.stockMovementSheet = { open: true, assetId: action.payload };
    },
    closeStockMovementSheet(state) {
      state.stockMovementSheet = { open: false, assetId: null };
    },
    setAddAssetDialog(state, action: PayloadAction<boolean>) {
      state.addAssetDialog = action.payload;
    },
    setAddCategoryDialog(state, action: PayloadAction<boolean>) {
      state.addCategoryDialog = action.payload;
    },
    openClientSheet(state, action: PayloadAction<string | null>) {
      state.clientSheet = { open: true, clientId: action.payload };
    },
    closeClientSheet(state) {
      state.clientSheet = { open: false, clientId: null };
    },
    openAddQuoteItemSheet(state, action: PayloadAction<string>) {
      state.addQuoteItemSheet = { open: true, quoteId: action.payload };
    },
    closeAddQuoteItemSheet(state) {
      state.addQuoteItemSheet = { open: false, quoteId: null };
    },
    openUserDrawer(state, action: PayloadAction<string | null>) {
      state.userDrawer = { open: true, userId: action.payload };
    },
    closeUserDrawer(state) {
      state.userDrawer = { open: false, userId: null };
    },
  },
});

export const {
  openStockMovementSheet,
  closeStockMovementSheet,
  setAddAssetDialog,
  setAddCategoryDialog,
  openClientSheet,
  closeClientSheet,
  openAddQuoteItemSheet,
  closeAddQuoteItemSheet,
  openUserDrawer,
  closeUserDrawer,
} = uiSlice.actions;

export default uiSlice.reducer;
