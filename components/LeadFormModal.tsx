
import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { LeadCardData } from '../types';
import { Icon } from './ui/Icon';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Omit<LeadCardData, 'id'>) => void;
  existingLeads: LeadCardData[];
}

const COUNTRY_CODES = [
  { name: 'Brasil', code: '+55' },
  { name: 'EUA', code: '+1' },
  { name: 'Portugal', code: '+351' },
  { name: 'Reino Unido', code: '+44' },
  { name: 'Alemanha', code: '+49' },
  { name: 'França', code: '+33' },
  { name: 'Espanha', code: '+34' },
  { name: 'Itália', code: '+39' },
  { name: 'Argentina', code: '+54' },
  { name: 'Uruguai', code: '+598' },
];

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose, onSave, existingLeads }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    source: '',
    note: ''
  });
  
  const [phoneData, setPhoneData] = useState({
    countryCode: '+55',
    number: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [showPhoneError, setShowPhoneError] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', source: '', note: '' });
      setPhoneData({ countryCode: '+55', number: '' });
      setError(null);
      setShowPhoneError(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };
  
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPhoneData(prev => ({ ...prev, countryCode: e.target.value }));
      if (error) setError(null);
  };

  const handlePhoneNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only numbers
      const value = e.target.value.replace(/\D/g, '');
      setPhoneData(prev => ({ ...prev, number: value }));
      if (error) setError(null);
      if (showPhoneError) setShowPhoneError(false);
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name) {
      setError('Por favor, preencha o nome.');
      return;
    }

    if (!phoneData.number.trim()) {
      setShowPhoneError(true);
      return;
    }
    
    // Format E.164: +<country_code><number>
    const formattedPhone = `${phoneData.countryCode}${phoneData.number}`;
    
    // Validation: Check if phone already exists
    if (formattedPhone) {
        const numericNewPhone = formattedPhone.replace(/\D/g, '');
        
        const phoneExists = existingLeads.some(lead => {
            const numericExisting = (lead.phone || '').replace(/\D/g, '');
            // Only compare if both have valid numeric values
            return numericExisting.length > 0 && numericExisting === numericNewPhone;
        });

        if (phoneExists) {
            setError("Não foi possível criar o registro do lead, o telefone informado já existe");
            return;
        }
    }

    // Validation: Check if email already exists
    if (formData.email && formData.email.trim()) {
        const emailInput = formData.email.trim().toLowerCase();
        const emailExists = existingLeads.some(lead => 
            (lead.email || '').trim().toLowerCase() === emailInput
        );

        if (emailExists) {
            setError("Não foi possível criar o registro do lead, o email informado já existe");
            return;
        }
    }
    
    onSave({
      name: formData.name,
      phone: formattedPhone,
      email: formData.email,
      source: formData.source || 'Outros',
      note: formData.note
    });
    
    // Reset form is handled by parent closing/reopening or effect, but good practice here too if used differently
    setFormData({ name: '', email: '', source: '', note: '' });
    setPhoneData({ countryCode: '+55', number: '' });
    setError(null);
    setShowPhoneError(false);
  };

  // Styles reused for consistent look
  const inputClasses = "form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#131217] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d8d7e0] dark:border-primary/30 bg-white dark:bg-background-dark focus:border-primary h-14 placeholder:text-[#696581] p-[15px] text-base font-normal leading-normal";
  const selectClasses = "appearance-none bg-none flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#131217] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d8d7e0] dark:border-primary/30 bg-white dark:bg-background-dark focus:border-primary h-14 placeholder:text-[#696581] px-[15px] py-3.5 text-base font-normal leading-normal";
  
  const errorInputStyle = "border-red-500 focus:ring-red-200 focus:border-red-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[960px]">
      <div className="flex flex-col w-full">
        <div className="flex flex-wrap justify-between gap-3 p-6 pb-0">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#131217] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Cadastro de Novo Lead</p>
            <p className="text-[#696581] dark:text-gray-400 text-base font-normal leading-normal">Preencha as informações abaixo para adicionar um novo lead.</p>
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          <div className="flex flex-col gap-6">
            <label className="flex flex-col w-full">
              <p className="text-[#131217] dark:text-white text-base font-medium leading-normal pb-2">Nome completo</p>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Digite o nome completo" 
              />
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#131217] dark:text-white text-base font-medium leading-normal pb-2">Telefone <span className="text-red-500">*</span></p>
                <div className="flex gap-2">
                    <div className="relative w-36 shrink-0">
                        <select 
                            value={phoneData.countryCode}
                            onChange={handleCountryChange}
                            className={`${selectClasses} pr-8 ${showPhoneError ? errorInputStyle : ''}`}
                        >
                            {COUNTRY_CODES.map(c => (
                                <option key={c.name} value={c.code}>{c.name} ({c.code})</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#696581]">
                             <Icon name="expand_more" style={{fontSize: '16px'}} />
                        </div>
                    </div>
                    <input 
                      value={phoneData.number}
                      onChange={handlePhoneNumChange}
                      className={`${inputClasses} ${showPhoneError ? errorInputStyle : ''}`}
                      placeholder="9 9999-9999" 
                      type="tel"
                    />
                </div>
                {showPhoneError && (
                    <span className="text-xs text-red-500 mt-1 font-medium animate-fade-in">Telefone é obrigatório</span>
                )}
              </label>
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#131217] dark:text-white text-base font-medium leading-normal pb-2">Email</p>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="exemplo@email.com" 
                />
              </label>
            </div>
            
            <label className="flex flex-col w-full">
              <p className="text-[#131217] dark:text-white text-base font-medium leading-normal pb-2">Fonte do Lead</p>
              <div className="relative">
                <select 
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className={selectClasses}
                >
                  <option disabled value="">Selecione a fonte</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Site">Site</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Indicação">Indicação</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Evento">Evento</option>
                  <option value="Outros">Outros</option>
                </select>
                <div className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[#696581]">
                    <Icon name="expand_more" />
                </div>
              </div>
            </label>
            
            <label className="flex flex-col w-full">
              <p className="text-[#131217] dark:text-white text-base font-medium leading-normal pb-2">Observação rápida</p>
              <textarea 
                name="note"
                value={formData.note}
                onChange={handleChange}
                className="form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-[#131217] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#d8d7e0] dark:border-primary/30 bg-white dark:bg-background-dark focus:border-primary placeholder:text-[#696581] p-[15px] text-base font-normal leading-normal" 
                placeholder="Adicione uma observação sobre o lead..." 
                rows={4}
              ></textarea>
            </label>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-3 animate-fade-in">
                <Icon name="error" className="text-xl shrink-0" />
                <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-[#ecebef] dark:border-gray-700">
            <button 
              onClick={onClose}
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-transparent text-[#696581] dark:text-gray-300 border border-transparent hover:bg-gray-100 dark:hover:bg-primary/10 gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-[120px] px-6 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 bg-primary text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-[120px] px-6 hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 transition-colors shadow-lg shadow-primary/20"
            >
              Salvar Lead
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
