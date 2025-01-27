import { Signal } from "@preact/signals";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { HiOutlineXMark as XMarkIcon } from "@preact-icons/hi2";
import { SidebarButton } from "@components/SidebarButton.tsx";
import { NavigationItem } from "@components/navigation/navigation-items.ts";
import { RoomNavigationItem } from "@components/navigation/room-items.ts";
import { IS_BROWSER } from "fresh/runtime";
import NavigationItemLink from "@components/navigation/navigation-item-link.tsx";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface MobileAppSidebarProps {
  navigationItems: NavigationItem[];
  roomNavigationItems: RoomNavigationItem[];
  sidebarOpen: Signal<boolean>;
}

export function MobileAppSidebar({
  navigationItems,
  roomNavigationItems,
  sidebarOpen,
}: MobileAppSidebarProps) {
  // Return any prerenderable JSX here which makes sense for your island
  if (!IS_BROWSER) return <div></div>;

  return (
    <Dialog
      open={true}
      onClose={(value: boolean) => (sidebarOpen.value = value)}
      className="relative z-50 lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
      />

      <div className="fixed inset-0 flex">
        <DialogPanel
          transition
          className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full">
          <TransitionChild>
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
              <SidebarButton
                onClick={() => (sidebarOpen.value = false)}
                class="-m-2.5 p-2.5"
                srOnly="Close sidebar">
                <XMarkIcon
                  aria-hidden="true"
                  size={24}
                  className="size-6 text-white"
                />
              </SidebarButton>
            </div>
          </TransitionChild>
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
            <div className="flex h-16 shrink-0 items-center">
              <img
                alt="Your Company"
                src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=500"
                className="h-8 w-auto"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigationItems.map((item) => (
                      <li key={item.name}>
                        <NavigationItemLink item={item} />
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs/6 font-semibold text-gray-400">
                    Your rooms
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {roomNavigationItems.map((team) => (
                      <li key={team.name}>
                        <a
                          href={team.href}
                          className={classNames(
                            team.current
                              ? "bg-gray-800 text-white"
                              : "text-gray-400 hover:bg-gray-800 hover:text-white",
                            "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold",
                          )}>
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                            {team.initial}
                          </span>
                          <span className="truncate">{team.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
