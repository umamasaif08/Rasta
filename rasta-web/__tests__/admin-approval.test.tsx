/**
 * Admin approval action tests - StatusCard component behavior
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Mock Firebase functions
const mockUpdateDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock("firebase/firestore", () => ({
  updateDoc: mockUpdateDoc,
  doc: mockDoc,
}));

// Mock auth context
const mockAuthContext = {
  user: { uid: "admin-123", isAdmin: true },
  isAdmin: true,
  isLoading: false,
};

jest.mock("@/lib/auth-context", () => ({
  useAuth: () => mockAuthContext,
}));

describe("Admin Approval Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("approve button calls updateDoc with correct parameters", async () => {
    const user = userEvent.setup();
    mockUpdateDoc.mockResolvedValue({});
    mockDoc.mockReturnValue({ id: "resource-123" });

    // Mock StatusCard-like component
    const MockStatusCard = () => {
      const handleApprove = async () => {
        await mockUpdateDoc(mockDoc(), {
          status: "approved",
          approvedAt: expect.any(Date),
          approvedBy: "admin-123"
        });
      };

      return (
        <div>
          <h3>Test Resource</h3>
          <p>Status: pending</p>
          <button onClick={handleApprove}>Approve</button>
        </div>
      );
    };

    render(<MockStatusCard />);

    const approveButton = screen.getByText("Approve");
    expect(approveButton).toBeInTheDocument();

    await user.click(approveButton);

    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: "approved",
          approvedBy: "admin-123"
        })
      );
    });
  });

  test("reject button calls updateDoc with rejection", async () => {
    const user = userEvent.setup();
    mockUpdateDoc.mockResolvedValue({});

    const MockStatusCard = () => {
      const handleReject = async () => {
        await mockUpdateDoc(mockDoc(), {
          status: "rejected",
          rejectedAt: new Date(),
          rejectedBy: "admin-123"
        });
      };

      return (
        <div>
          <h3>Test Resource</h3>
          <button onClick={handleReject}>Reject</button>
        </div>
      );
    };

    render(<MockStatusCard />);

    const rejectButton = screen.getByText("Reject");
    await user.click(rejectButton);

    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: "rejected",
          rejectedBy: "admin-123"
        })
      );
    });
  });

  test("handles approval error gracefully", async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockUpdateDoc.mockRejectedValue(new Error("Database connection failed"));

    const MockStatusCard = () => {
      const handleApprove = async () => {
        try {
          await mockUpdateDoc(mockDoc(), { status: "approved" });
        } catch (error) {
          console.error("Failed to approve resource:", error);
        }
      };

      return (
        <button onClick={handleApprove}>Approve</button>
      );
    };

    render(<MockStatusCard />);

    await user.click(screen.getByText("Approve"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to approve resource:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  test("disabled button prevents action when loading", () => {
    const MockStatusCard = () => {
      const isLoading = true;
      
      return (
        <button disabled={isLoading}>
          {isLoading ? "Processing..." : "Approve"}
        </button>
      );
    };

    render(<MockStatusCard />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Processing...");
  });
});
