"use client";

import { cva } from "class-variance-authority";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

import { Button } from "@/common/components/ui/button";
import { cn } from "@/common/utils/classnames";

// Hook to combine multiple refs
function useCombinedRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  const targetRef = useRef<T | null>(null);

  const combinedRef = useCallback((element: T | null) => {
    // Update the ref
    (targetRef as { current: T | null }).current = element;

    // Update all the refs
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === "function") {
        ref(element);
      } else {
        (ref as React.MutableRefObject<T | null>).current = element;
      }
    });
  }, refs); // eslint-disable-line react-hooks/exhaustive-deps

  return combinedRef;
}

// Create context for the sidebar
type SidebarContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  defaultOpen?: boolean;
  width: number;
  setWidth: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SidebarProvider({
  defaultOpen = true,
  children,
  minWidth = 200,
  maxWidth = 500,
}: SidebarProviderProps & { minWidth?: number; maxWidth?: number }) {
  const [open, setOpen] = useState(defaultOpen);
  const [width, setWidth] = useState(256); // Default width

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        defaultOpen,
        width,
        setWidth,
        minWidth,
        maxWidth,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// Sidebar components
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  resizable?: boolean;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, resizable = true, ...props }, ref) => {
    const { open, width, setWidth, minWidth = 200, maxWidth = 500 } = useSidebar();
    const [isResizing, setIsResizing] = useState(false);
    const internalRef = useRef<HTMLDivElement>(null);
    const combinedRef = useCombinedRefs<HTMLDivElement>(ref, internalRef);

    const startResizing = React.useCallback(
      (e: React.MouseEvent) => {
        if (!resizable) return;

        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);

        const startX = e.pageX;
        const startWidth = width;

        const onMouseMove = (e: MouseEvent) => {
          const newWidth = Math.min(Math.max(startWidth + e.pageX - startX, minWidth), maxWidth);
          setWidth(newWidth);
        };

        const onMouseUp = () => {
          setIsResizing(false);
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp, { once: true });
      },
      [resizable, width, setWidth, minWidth, maxWidth]
    );

    React.useEffect(() => {
      if (isResizing) {
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      } else {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }

      return () => {
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }, [isResizing]);

    return (
      <>
        <div
          ref={combinedRef}
          className={cn(
            "relative border-r border-border bg-sidebar flex h-full flex-col transition-all duration-300 ease-in-out overflow-hidden",
            open ? "" : "w-14",
            className
          )}
          style={open ? { width: `${width}px` } : {}}
          {...props}
        >
          {children}
          {resizable && open && (
            <div className="absolute right-0 top-0 w-1 h-full cursor-col-resize" onMouseDown={startResizing} />
          )}
        </div>
        {isResizing && <div className="fixed inset-0 z-50" />}
      </>
    );
  }
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("p-2", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex-1 overflow-auto py-2", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("p-2", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarFooter.displayName = "SidebarFooter";

const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("pb-4", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open } = useSidebar();

    if (!open) return null;

    return (
      <div ref={ref} className={cn("px-3 py-1 text-xs font-semibold text-muted-foreground", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-1", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const sidebarMenuVariants = cva("flex flex-col", {
  variants: {
    variant: {
      default: "space-y-1",
      button: "space-y-1",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "button";
}

const SidebarMenu = React.forwardRef<HTMLDivElement, SidebarMenuProps>(
  ({ className, variant, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(sidebarMenuVariants({ variant }), className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("px-2", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & {
    isActive?: boolean;
    tooltip?: string;
    asChild?: boolean;
  }
>(({ className, isActive, tooltip, children, variant = "ghost", asChild, ...props }, ref) => {
  const { open } = useSidebar();

  return (
    <Button
      ref={ref}
      variant={variant}
      asChild={asChild}
      className={cn(
        "relative flex w-full items-center px-3 py-2 h-auto",
        "justify-start", // Always justify start to keep icons in place
        isActive && "bg-secondary",
        className
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          <span className="flex items-center gap-3 overflow-hidden">
            <span className="flex-shrink-0">{React.Children.toArray(children)[0]}</span>
            <span className={cn("truncate transition-all duration-300", !open && "opacity-0 w-0")}>
              {React.Children.toArray(children).slice(1)}
            </span>
          </span>
          {!open && tooltip && (
            <div className="absolute left-full ml-2 rounded-md bg-popover px-2 py-1 text-sm opacity-0 group-hover:opacity-100 transition-opacity z-50">
              {tooltip}
            </div>
          )}
        </>
      )}
    </Button>
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
  ({ className, children, variant = "ghost", size = "icon", ...props }, ref) => {
    const { open, setOpen } = useSidebar();

    return (
      <Button ref={ref} variant={variant} size={size} onClick={() => setOpen(!open)} className={className} {...props}>
        {children || (open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
      </Button>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarRail = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { open, setOpen } = useSidebar();

    return (
      <div
        ref={ref}
        className={cn(
          "absolute -right-3 top-5 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm cursor-pointer z-10 hover:bg-muted transition-colors",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {open ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </div>
    );
  }
);
SidebarRail.displayName = "SidebarRail";

const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex-1 overflow-hidden", className)} {...props}>
        {children}
      </div>
    );
  }
);
SidebarInset.displayName = "SidebarInset";

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger
};
