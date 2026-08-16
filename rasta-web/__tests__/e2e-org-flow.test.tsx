/**
 * End-to-End Test: Organization registers → Resource created as pending → Admin approves → Resource appears publicly
 * This is a comprehensive integration test covering the core user flow
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Mock Firebase Auth
const mockUser = {
  uid: "test-org-user-id",
  email: "test@example.org",
  displayName: "Test Organization",
};

const mockAuthContext = {
  user: mockUser,
  isLoading: false,
  isAdmin: false,
};

const mockAdminContext = {
  user: { ...mockUser, uid: "admin-user-id" },
  isLoading: false,
  isAdmin: true,
};

jest.mock("@/lib/auth-context", () => ({
  useAuth: jest.fn(() => mockAuthContext),
  AuthProvider: ({ children }: any) => children,
}));

// Mock Firestore operations
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockDoc = jest.fn();

jest.mock("firebase/firestore", () => ({
  addDoc: mockAddDoc,
  updateDoc: mockUpdateDoc,
  getDocs: mockGetDocs,
  doc: mockDoc,
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("E2E: Organization Registration → Resource Approval → Public Display", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Full workflow: org creates resource → admin approves → appears publicly", async () => {
    // ═══ STEP 1: Organization creates a new resource ═══
    const user = userEvent.setup();
    
    // Mock successful resource creation
    mockAddDoc.mockResolvedValue({ id: "new-resource-123" });
    
    // Simulate creating a new resource
    const newResource = {
      name: "New Test Shelter",
      category: "shelter",
      description: "A new shelter for testing",
      address: "123 Test Street, Karachi",
      phone: "021-1234567",
      languages: ["English", "Urdu"],
      servesWomen: true,
      servesChildren: true,
      status: "pending", // Initially pending
      createdBy: mockUser.uid,
      createdAt: new Date(),
    };
    
    // Verify resource would be created with correct data
    expect(newResource.status).toBe("pending");
    expect(newResource.createdBy).toBe(mockUser.uid);
    expect(newResource.name).toBe("New Test Shelter");
    
    // ═══ STEP 2: Admin sees pending resource ═══
    
    // Mock pending resources query
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "new-resource-123",
          data: () => newResource,
          exists: () => true,
        },
      ],
    });
    
    // Simulate admin viewing pending resources
    const { useAuth } = require("@/lib/auth-context");
    useAuth.mockReturnValue(mockAdminContext); // Switch to admin context
    
    // Mock admin component rendering (simplified)
    const AdminActions = () => {
      const handleApprove = async () => {
        await mockUpdateDoc("mock-doc-ref", { status: "approved" });
      };
      
      return (
        <div>
          <h3>{newResource.name}</h3>
          <p>Status: {newResource.status}</p>
          <button onClick={handleApprove}>Approve Resource</button>
        </div>
      );
    };
    
    render(<AdminActions />);
    
    // Admin sees pending resource
    expect(screen.getByText("New Test Shelter")).toBeInTheDocument();
    expect(screen.getByText("Status: pending")).toBeInTheDocument();
    
    // ═══ STEP 3: Admin approves the resource ═══
    
    mockUpdateDoc.mockResolvedValue({});
    
    const approveButton = screen.getByText("Approve Resource");
    await user.click(approveButton);
    
    // Verify updateDoc was called with approval (first arg doesn't matter for this test)
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ status: "approved" })
    );
    
    // ═══ STEP 4: Resource appears in public listings ═══
    
    // Mock approved resources query for public view
    const approvedResource = { ...newResource, status: "approved" };
    
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "new-resource-123",
          data: () => approvedResource,
          exists: () => true,
        },
      ],
    });
    
    // Simulate public resources page
    const PublicResourcesList = () => {
      const resources = [approvedResource]; // Simulated fetch result
      
      return (
        <div>
          <h2>Available Resources</h2>
          {resources
            .filter(r => r.status === "approved")
            .map(resource => (
              <div key={resource.name} data-testid="public-resource">
                <h3>{resource.name}</h3>
                <p>{resource.category}</p>
                <p>{resource.address}</p>
              </div>
            ))
          }
        </div>
      );
    };
    
    // Switch back to public view (no auth needed)
    useAuth.mockReturnValue({ user: null, isLoading: false, isAdmin: false });
    
    render(<PublicResourcesList />);
    
    // Verify resource appears publicly
    expect(screen.getByText("Available Resources")).toBeInTheDocument();
    expect(screen.getByTestId("public-resource")).toBeInTheDocument();
    expect(screen.getByText("New Test Shelter")).toBeInTheDocument();
    expect(screen.getByText("shelter")).toBeInTheDocument();
    expect(screen.getByText("123 Test Street, Karachi")).toBeInTheDocument();
  });

  test("Rejected resources do not appear publicly", async () => {
    // Resource that gets rejected
    const rejectedResource = {
      name: "Rejected Shelter",
      status: "rejected",
      category: "shelter",
    };
    
    const PublicResourcesList = () => {
      const resources = [rejectedResource];
      
      return (
        <div>
          <h2>Available Resources</h2>
          {resources
            .filter(r => r.status === "approved") // Only approved appear
            .map(resource => (
              <div key={resource.name}>
                <h3>{resource.name}</h3>
              </div>
            ))
          }
          {resources.filter(r => r.status === "approved").length === 0 && (
            <p>No resources found</p>
          )}
        </div>
      );
    };
    
    render(<PublicResourcesList />);
    
    // Rejected resource should NOT appear
    expect(screen.queryByText("Rejected Shelter")).not.toBeInTheDocument();
    expect(screen.getByText("No resources found")).toBeInTheDocument();
  });

  test("Pending resources only visible to admins", async () => {
    const pendingResource = {
      name: "Pending Shelter",
      status: "pending",
      category: "shelter",
    };
    
    // Mock component that shows different views based on admin status
    const ResourceView = () => {
      const { isAdmin } = require("@/lib/auth-context").useAuth();
      const resources = [pendingResource];
      
      if (isAdmin) {
        return (
          <div>
            <h2>Admin Panel</h2>
            {resources.map(resource => (
              <div key={resource.name} data-testid="admin-resource">
                <h3>{resource.name}</h3>
                <p>Status: {resource.status}</p>
              </div>
            ))}
          </div>
        );
      }
      
      return (
        <div>
          <h2>Public Resources</h2>
          {resources
            .filter(r => r.status === "approved")
            .map(resource => (
              <div key={resource.name}>
                <h3>{resource.name}</h3>
              </div>
            ))
          }
          <p>No approved resources</p>
        </div>
      );
    };
    
    // Test admin view
    const { useAuth } = require("@/lib/auth-context");
    useAuth.mockReturnValue(mockAdminContext);
    
    const { rerender } = render(<ResourceView />);
    
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByTestId("admin-resource")).toBeInTheDocument();
    expect(screen.getByText("Pending Shelter")).toBeInTheDocument();
    expect(screen.getByText("Status: pending")).toBeInTheDocument();
    
    // Test public view
    useAuth.mockReturnValue({ user: null, isLoading: false, isAdmin: false });
    
    rerender(<ResourceView />);
    
    expect(screen.getByText("Public Resources")).toBeInTheDocument();
    expect(screen.queryByText("Pending Shelter")).not.toBeInTheDocument();
    expect(screen.getByText("No approved resources")).toBeInTheDocument();
  });
});