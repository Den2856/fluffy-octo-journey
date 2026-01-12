import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { Check, ChevronDown } from 'lucide-react'

interface StatusOption {
  value: string
  label: string
  colorClass: string
}

interface StatusSelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const statusOptions: StatusOption[] = [
  { value: 'All', label: 'all', colorClass: 'bg-gray-100 text-ink/60' },
  { value: 'New', label: 'new', colorClass: 'bg-gray-100 text-ink/70' },
  { value: 'Planned', label: 'planned', colorClass: 'bg-d-lime-700 text-ink' },
  { value: 'In_progress', label: 'In progress', colorClass: 'bg-d-lime-800 text-ink' },
  { value: 'Done', label: 'done', colorClass: 'bg-d-lime-900 text-ink' },
  { value: 'Canceled', label: 'canceled', colorClass: 'bg-d-warn-50 text-d-ink' },
]

export function StatusSelect({ value, onChange, className = "" }: StatusSelectProps) {
  const selectedOption = statusOptions.find(option => option.value === value) || statusOptions[0]

  return (
    <div className={`relative ${className}`}>
      <Listbox value={value} onChange={onChange}>
        <Listbox.Button className={`relative w-full min-w-[120px] rounded-full border-none px-3 py-1 text-left text-[11px] font-medium capitalize cursor-pointer outline-none focus:ring-0 ${selectedOption.colorClass}`}>
          <span className="block truncate">{selectedOption.label}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-3 w-3 text-current" aria-hidden="true" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-2xl bg-white py-1 text-[11px] shadow-lg ring-1 ring-black/5 focus:outline-none">
            {statusOptions.map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-d-lime-800/50 text-ink' : 'text-ink/80'
                  } ${option.value === value ? 'font-medium' : 'font-normal'}`
                }
                value={option.value}
              >
                {({ selected }) => (
                  <>
                    <span className="block truncate">{option.label}</span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-d-lime-900">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  )
}