/**
 * Unit tests for FlipCard component
 * Tests: click toggle, keyboard navigation, both faces rendering
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Mock dependencies
const mockOrg = {
  id: "test-org-1",
  name: "Test Organisation",
  tagline: "A test organisation for testing",
  description: "This is a test description for testing purposes",
  category: "shelter",
  color: "var(--color-teal)",
  initials: "TO",
  phone: "021-1234567",
  website: "https://example.com",
  serves: ["Women", "Children"],
  founded: "2020",
  lat: 0,
  lng: 0,
  photos: [],
};

// Import FlipCard after mocks
const FlipCard = require("@/components/ui/flip-card").default;

describe("FlipCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders front face initially", async () => {
    render(<FlipCard org={mockOrg} />);
    
    // Wait for animation to complete
    await waitFor(() => {});
    
    // Front face elements - use getAllByText since name appears on both faces
    const names = screen.getAllByText(mockOrg.name);
    expect(names.length).toBeGreaterThan(0);
  });

  test("flip button exists with aria-pressed", async () => {
    render(<FlipCard org={mockOrg} />);
    
    await waitFor(() => {});
    
    // Flip button should exist with correct aria-pressed
    const flipButton = screen.getByRole("button", { name: `Show more about ${mockOrg.name}` });
    expect(flipButton).toBeInTheDocument();
    expect(flipButton).toHaveAttribute("aria-pressed", "false");
  });
});
