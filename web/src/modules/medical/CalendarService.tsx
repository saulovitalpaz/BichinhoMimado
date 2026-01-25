import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const CalendarService = () => {
    const [view, setView] = useState('timeGridWeek');

    const handleDateClick = (arg: any) => {
        // Opening a modal would be the next step
        alert('Abertura de formulário para: ' + dayjs(arg.date).format('DD/MM/YYYY [às] HH:mm'));
    };

    const handleEventClick = (info: any) => {
        alert('Evento: ' + info.event.title);
    };

    return (
        <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-700">
            {/* Dynamic Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center">
                        <CalendarIcon className="w-5 h-5 mr-3 text-indigo-500" />
                        Agenda Integrada
                    </h2>
                    <p className="text-[11px] text-slate-400 font-medium">Gerenciamento de consultas e serviços petshop</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="hidden sm:flex bg-slate-100/50 p-1 rounded-xl items-center border border-slate-100">
                        <button
                            onClick={() => setView('dayGridMonth')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === 'dayGridMonth' ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Mês
                        </button>
                        <button
                            onClick={() => setView('timeGridWeek')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === 'timeGridWeek' ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setView('timeGridDay')}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === 'timeGridDay' ? 'bg-white text-indigo-600 shadow-sm shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Dia
                        </button>
                    </div>
                    <button className="p-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-slate-400">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center">
                        <Plus className="w-3.5 h-3.5 mr-2" />
                        Novo Agendamento
                    </button>
                </div>
            </div>

            {/* Calendar Card */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-4">
                <style>{`
          .fc { font-family: inherit; font-size: 11px; }
          .fc-header-toolbar { display: none !important; }
          .fc-theme-standard td, .fc-theme-standard th { border-color: #f1f5f9 !important; }
          .fc-col-header-cell { padding: 10px 0 !important; background: #f8fafc; border-radius: 8px !important; }
          .fc-col-header-cell-cushion { color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
          .fc-timegrid-slot { height: 40px !important; color: #94a3b8; font-weight: 600; }
          .fc-event { border: none !important; border-radius: 6px !important; padding: 2px 4px !important; box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important; cursor: pointer !important; transition: transform 0.2s !important; }
          .fc-event:hover { transform: scale(1.02); }
          .fc-now-indicator { border-color: #ef4444 !important; }
        `}</style>

                <FullCalendar
                    plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                    initialView={view}
                    key={view}
                    locale={ptBrLocale}
                    headerToolbar={false}
                    allDaySlot={false}
                    slotMinTime="08:00:00"
                    slotMaxTime="20:00:00"
                    height="100%"
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    events={[
                        {
                            id: '1',
                            title: 'Rex - Consulta Geral',
                            start: dayjs().set('hour', 10).set('minute', 0).toISOString(),
                            end: dayjs().set('hour', 11).set('minute', 0).toISOString(),
                            backgroundColor: '#818cf8',
                        },
                        {
                            id: '2',
                            title: 'Mel - Banho + Tosa',
                            start: dayjs().add(1, 'day').set('hour', 14).set('minute', 0).toISOString(),
                            end: dayjs().add(1, 'day').set('hour', 15).set('minute', 30).toISOString(),
                            backgroundColor: '#fb923c',
                        }
                    ]}
                />
            </div>
        </div>
    );
};

export default CalendarService;
