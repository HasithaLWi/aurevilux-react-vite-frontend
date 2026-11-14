import React, { useState } from "react";
import { Plus, X, Trash2, MapPin } from "lucide-react";
import type { SavedAddress, UserProfile } from "../../types";

interface AddressesTabProps {
  addresses: SavedAddress[];
  profile: UserProfile;
  onSaveAddress: (
    addressData: SavedAddress,
    editingId: string | null
  ) => Promise<void>;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
}

export const AddressesTab: React.FC<AddressesTabProps> = ({
  addresses,
  profile,
  onSaveAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) => {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    type: "Home" as "Home" | "Office" | "Other",
    isDefault: false,
    name: profile.name || "",
    street: "",
    city: "",
    postalCode: "",
    country: "United States",
    phone: profile.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: SavedAddress = {
      id: editingAddressId || `addr-${Date.now()}`,
      ...addressForm,
    };
    await onSaveAddress(newAddr, editingAddressId);
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white uppercase tracking-wider">
            Saved Addresses
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage white-glove courier shipping destinations.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAddressId(null);
            setAddressForm({
              type: "Home",
              isDefault: false,
              name: profile.name || "",
              street: "",
              city: "",
              postalCode: "",
              country: "United States",
              phone: profile.phone || "",
            });
            setShowAddressForm(true);
          }}
          className="inline-flex items-center space-x-2 bg-brand-gold hover:bg-brand-goldHover text-brand-black px-4 py-2 text-xs font-bold tracking-widest rounded uppercase transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Address Form Modal/Inline */}
      {showAddressForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-brand-gold/30 bg-zinc-950 p-6 rounded-lg space-y-4 w-full"
        >
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="font-serif text-sm uppercase tracking-wider text-brand-gold font-bold">
              {editingAddressId ? "Edit Address" : "New Delivery Address"}
            </h3>
            <button
              type="button"
              onClick={() => setShowAddressForm(false)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Recipient Name
              </label>
              <input
                type="text"
                required
                value={addressForm.name}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, name: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white rounded outline-none focus:border-brand-gold/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Address Type
              </label>
              <select
                value={addressForm.type}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    type: e.target.value as any,
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white rounded outline-none focus:border-brand-gold/50"
              >
                <option value="Home">Home</option>
                <option value="Office">Office / Atelier</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Street Address
              </label>
              <input
                type="text"
                required
                placeholder="123 Park Street, Suite 4B"
                value={addressForm.street}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, street: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white rounded outline-none focus:border-brand-gold/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                City
              </label>
              <input
                type="text"
                required
                value={addressForm.city}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, city: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white rounded outline-none focus:border-brand-gold/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Postal / ZIP Code
              </label>
              <input
                type="text"
                required
                value={addressForm.postalCode}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    postalCode: e.target.value,
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white rounded outline-none focus:border-brand-gold/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Country
              </label>
              <input
                type="text"
                required
                value={addressForm.country}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    country: e.target.value,
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white rounded outline-none focus:border-brand-gold/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, phone: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white rounded outline-none focus:border-brand-gold/50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultAddr"
              checked={addressForm.isDefault}
              onChange={(e) =>
                setAddressForm({
                  ...addressForm,
                  isDefault: e.target.checked,
                })
              }
              className="accent-brand-gold"
            />
            <label
              htmlFor="isDefaultAddr"
              className="text-xs text-zinc-300 font-light cursor-pointer"
            >
              Set as default shipping address
            </label>
          </div>

          <div className="pt-3 border-t border-zinc-900 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddressForm(false)}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white uppercase font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-goldHover text-brand-black px-6 py-2 text-xs font-bold tracking-widest rounded uppercase transition-colors"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {/* Addresses Grid or Zero State */}
      {addresses.length === 0 ? (
        <div className="border border-dashed border-zinc-900 bg-zinc-950/40 p-12 rounded-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-brand-gold">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-sm uppercase tracking-wider text-white font-bold">
              No Saved Delivery Destinations
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              You haven't recorded any shipping destinations yet. Add an address for white-glove courier delivery.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingAddressId(null);
              setAddressForm({
                type: "Home",
                isDefault: true,
                name: profile.name || "",
                street: "",
                city: "",
                postalCode: "",
                country: "United States",
                phone: profile.phone || "",
              });
              setShowAddressForm(true);
            }}
            className="inline-flex items-center space-x-2 bg-brand-gold hover:bg-brand-goldHover text-brand-black px-5 py-2 text-xs font-bold tracking-widest rounded uppercase transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`border p-6 rounded-lg bg-zinc-950/60 relative space-y-4 transition-all w-full ${
                addr.isDefault
                  ? "border-brand-gold/40 shadow-[0_0_15px_rgba(197,168,128,0.08)]"
                  : "border-zinc-900 hover:border-zinc-800"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold tracking-widest text-brand-gold uppercase px-2.5 py-0.5 rounded bg-brand-burgundy/15 border border-brand-gold/20">
                    {addr.type}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">
                      &middot; Default
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingAddressId(addr.id || null);
                      setAddressForm({
                        type: addr.type || "Home",
                        isDefault: addr.isDefault,
                        name: addr.name,
                        street: addr.street,
                        city: addr.city,
                        postalCode: addr.postalCode,
                        country: addr.country,
                        phone: addr.phone,
                      });
                      setShowAddressForm(true);
                    }}
                    className="text-[10px] text-zinc-400 hover:text-brand-gold font-bold uppercase"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteAddress(addr.id!)}
                    className="text-zinc-600 hover:text-red-400"
                    title="Delete address"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-zinc-300 space-y-1">
                <p className="font-semibold text-white">{addr.name}</p>
                <p>{addr.street}</p>
                <p>
                  {addr.city}, {addr.postalCode}
                </p>
                <p>{addr.country}</p>
                <p className="text-zinc-500 text-[11px] pt-1">{addr.phone}</p>
              </div>

              {!addr.isDefault && (
                <button
                  onClick={() => onSetDefaultAddress(addr.id!)}
                  className="text-[9.5px] font-bold tracking-widest text-brand-gold hover:text-white uppercase pt-1"
                >
                  Make Default Destination
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

