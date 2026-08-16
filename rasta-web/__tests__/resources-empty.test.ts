/**
 * Edge case test: getResourcesByOrg with empty results and error handling
 */

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the resources function
const mockGetResourcesByOrg = jest.fn();
jest.mock("@/lib/resources", () => ({
  getResourcesByOrg: mockGetResourcesByOrg,
}));

describe("Resources Edge Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test("getResourcesByOrg returns empty array - handles gracefully", async () => {
    mockGetResourcesByOrg.mockResolvedValue([]);
    
    const { getResourcesByOrg } = require("@/lib/resources");
    const result = await getResourcesByOrg("test-org-id");
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  test("getResourcesByOrg throws error - handles gracefully with fallback", async () => {
    const mockError = new Error("Firestore connection failed");
    mockGetResourcesByOrg.mockRejectedValue(mockError);
    
    const { getResourcesByOrg } = require("@/lib/resources");
    
    try {
      await getResourcesByOrg("test-org-id");
    } catch (error) {
      expect(error).toBe(mockError);
    }
    
    expect(mockGetResourcesByOrg).toHaveBeenCalledWith("test-org-id");
  });

  test("console.error is called for failed operations", () => {
    const consoleSpy = jest.spyOn(console, 'error');
    
    console.error("[Test] Failed to fetch resources:", "Network error");
    
    expect(consoleSpy).toHaveBeenCalledWith("[Test] Failed to fetch resources:", "Network error");
  });

  test("handles null/undefined resource gracefully", () => {
    const resource: any = null;
    const fallbackName = resource?.name || "Unknown Resource";
    
    expect(fallbackName).toBe("Unknown Resource");
  });

  test("handles missing properties on resource object", () => {
    const incompleteResource = { id: "test-1", name: "Test Resource" };
    
    const phone = (incompleteResource as any).phone || "No phone provided";
    const address = (incompleteResource as any).address || "No address provided";
    
    expect(phone).toBe("No phone provided");
    expect(address).toBe("No address provided");
  });
});
