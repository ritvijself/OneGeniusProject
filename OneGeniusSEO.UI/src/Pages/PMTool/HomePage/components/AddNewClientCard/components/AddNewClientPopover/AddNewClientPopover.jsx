import React, { useState, useEffect, useRef } from "react";
import { Popover } from "react-tiny-popover";
import { FocusTrap } from "focus-trap-react";
import { Button, Input, Select } from "@/components/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";
import { validateURL } from "@/utils/common";

const initialFormData = {
  clientName: "",
  websiteUrl: "",
  projectManager: "alice",
  scope: "Digital Marketing",
};

const AddNewClientPopover = ({
  isOpen,
  setIsOpen,
  children,
  clientData = null,
  isEditMode = false,
}) => {
  const queryClient = useQueryClient();
  const clientNameInputRef = useRef(null);

  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isFocusTrapActive, setIsFocusTrapActive] = useState(false);

  const projectManagerOptions = [
    { value: "alice", label: "Alice Johnson" },
    { value: "bob", label: "Bob Williams" },
    { value: "charlie", label: "Charlie Brown" },
    { value: "diana", label: "Diana Miller" },
  ];

  const resetForm = () => {
    if (isEditMode && clientData) {
      setFormData({
        clientName: clientData.name || "",
        websiteUrl: clientData.website_url || "",
        projectManager: clientData.project_manager || "Alice Johnson",
        scope: "Digital Marketing",
      });
    } else {
      setFormData(initialFormData);
    }
    setFieldErrors({});
  };

  const closePopover = () => {
    setIsFocusTrapActive(false);
    resetForm();
    setIsOpen(false);
  };

  // Initialize form data when popover opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, isEditMode, clientData]);

  // Focus the first input when popover opens and activate focus trap
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure popover is fully rendered
      const timer = setTimeout(() => {
        setIsFocusTrapActive(true);
        if (clientNameInputRef.current) {
          clientNameInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsFocusTrapActive(false);
    }
  }, [isOpen]);

  const { mutate: saveClient, isPending } = useMutation({
    mutationFn: async (client) => {
      if (isEditMode && clientData) {
        const { data } = await api.put(`/api/clients/${clientData.id}`, {
          name: client.clientName,
          website_url: client.websiteUrl,
        });
        return data;
      } else {
        const { data } = await api.post("/api/clients", {
          name: client.clientName,
          website_url: client.websiteUrl,
        });
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["clients"], (oldData) => {
        if (isEditMode && clientData) {
          // Update existing client
          return {
            ...oldData,
            clients: (oldData?.clients || []).map((client) =>
              client.id === clientData.id ? data.client : client
            ),
          };
        } else {
          // Add new client
          return {
            ...oldData,
            clients: [...(oldData?.clients || []), data.client],
          };
        }
      });
      closePopover();
    },
    onError: (error) => {
      console.error(
        `Error ${isEditMode ? "updating" : "adding"} client:`,
        error
      );
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        `An unexpected error occurred while ${
          isEditMode ? "updating" : "adding"
        } the client`;

      // Set generic error for the client name field if no specific field error is provided
      setFieldErrors({
        clientName: errorMessage,
      });
    },
  });

  // Add keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Enter" && !isPending) {
        const focusedElement = document.activeElement;

        // Only handle Enter if it's not on a button, or if it's specifically on the submit button
        if (focusedElement && focusedElement.tagName === "BUTTON") {
          // If it's a button, let the button handle its own click
          return;
        }

        // Handle Enter on input fields
        if (
          focusedElement &&
          (focusedElement.tagName === "INPUT" ||
            focusedElement.tagName === "SELECT")
        ) {
          e.preventDefault();
          handleSubmit();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        closePopover();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, isPending, formData]);

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleSubmit = () => {
    const newFieldErrors = {};

    // Validate client name
    if (!formData.clientName.trim()) {
      newFieldErrors.clientName = "Client name is required!";
    }

    // Validate website URL
    const urlError = validateURL(formData.websiteUrl);
    if (urlError) {
      newFieldErrors.websiteUrl = urlError;
    }

    // If there are any errors, show them and don't submit
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setFieldErrors({});
    saveClient(formData);
  };

  const handleCancel = () => {
    closePopover();
  };

  return (
    <Popover
      isOpen={isOpen}
      positions={["right", "left", "top", "bottom"]}
      onClickOutside={() => setIsOpen(false)}
      padding={10}
      content={
        <FocusTrap
          active={isFocusTrapActive}
          focusTrapOptions={{
            escapeDeactivates: false,
            clickOutsideDeactivates: true,
            onDeactivate: () => {
              setIsFocusTrapActive(false);
            },
            setReturnFocus: true,
          }}
        >
          <div
            className="tw:bg-white tw:border tw:border-gray-200 tw:rounded-lg tw:shadow-xl tw:w-80"
            style={{ zIndex: 9999 }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-client-title"
          >
            {/* Header */}
            <div className="tw:px-4 tw:py-3 tw:border-b tw:border-gray-200">
              <div
                id="add-client-title"
                className="tw:text-sm tw:font-semibold tw:text-gray-800"
              >
                {isEditMode ? "Edit client" : "Add client"}
              </div>
            </div>

            {/* Form */}
            <div className="tw:p-4 tw:space-y-3">
              <Input
                ref={clientNameInputRef}
                label="Client name"
                placeholder="e.g. Acme Corporation"
                value={formData.clientName}
                onChange={handleInputChange("clientName")}
                error={fieldErrors.clientName}
                required
              />

              <Input
                label="Website URL"
                type="url"
                placeholder="https://example.com"
                value={formData.websiteUrl}
                onChange={handleInputChange("websiteUrl")}
                error={fieldErrors.websiteUrl}
              />

              <Select
                label="Project manager"
                options={projectManagerOptions}
                value={formData.projectManager}
                onChange={handleInputChange("projectManager")}
                placeholder="Select project manager"
                disabled={true}
              />

              <Input
                label="Scope"
                type="text"
                placeholder="e.g. Digital Marketing"
                value={formData.scope}
                disabled={true}
                onChange={handleInputChange("scope")}
              />
            </div>

            {/* Footer */}
            <div className="tw:px-4 tw:py-3 tw:border-t tw:border-gray-200 tw:flex tw:justify-end tw:gap-2">
              <Button variant="secondary" onClick={handleCancel} isCompact>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isCompact
                isLoading={isPending}
              >
                {isEditMode ? "Update" : "Add"}
              </Button>
            </div>
          </div>
        </FocusTrap>
      }
    >
      {children}
    </Popover>
  );
};

export default AddNewClientPopover;
