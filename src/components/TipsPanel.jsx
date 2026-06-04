const tipSections = {
  plan: {
    title: 'Como criar um bom plano',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    sections: [
      {
        title: 'Contexto',
        body: 'Responda: qual problema esse plano resolve? Qual oportunidade estamos perseguindo? Quem é impactado?',
      },
      {
        title: 'Datas',
        body: 'Defina início e fim com base em restrições reais (prazo de cliente, campanha, lançamento). Evite prazos "em aberto".',
      },
      {
        title: 'Milestones',
        body: 'São entregas intermediárias com prazo — não tarefas do dia a dia. Ex: "Landing publicada", "Aprovação do cliente", "Campanha no ar". Devem ser poucas (3-7) e marcam progresso real.',
      },
    ],
  },
  goal: {
    title: 'Como criar metas SMART',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    sections: [
      {
        title: 'S — Específica',
        body: 'Seja claro e objetivo. Em vez de "vender mais", escreva "fechar 5 clientes enterprise no Q3".',
      },
      {
        title: 'M — Mensurável',
        body: 'Defina uma métrica numérica. Atual / Meta. Se não dá pra medir, não dá pra saber se foi atingida.',
      },
      {
        title: 'A — Alcançável',
        body: 'Desafiadora, mas possível. Olhe para o histórico e capacidade do time. Metas impossíveis desmotivam.',
      },
      {
        title: 'R — Relevante',
        body: 'Tem que estar conectada a um direcionamento estratégico. Se não impacta um pilar, revise.',
      },
      {
        title: 'T — Temporal',
        body: 'Defina prazo e trimestre. Sem prazo, vira desejo, não meta.',
      },
      {
        title: 'Milestones trimestrais',
        body: 'Quebre a meta anual em 3-4 entregas por trimestre. Cada milestone concluído é prova de progresso.',
      },
    ],
  },
  direction: {
    title: 'O que é um direcionamento',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 19 21 12 17 5 21 12 2"/>
      </svg>
    ),
    sections: [
      {
        title: 'Pilar estratégico',
        body: 'Direcionamentos são os 3-5 pilares que guiam as decisões da agência no ano. Toda meta deve se conectar a um deles.',
      },
      {
        title: 'Como criar bons direcionamentos',
        body: 'Pense nas grandes áreas: Crescimento, Pessoas, Produto, Marca, Operações. Evite mais de 5 — senão vira lista de tarefas.',
      },
      {
        title: 'Ativar / Desativar',
        body: 'Direcionamentos inativos ficam guardados mas não aparecem no painel. Útil para projetos sazonais.',
      },
    ],
  },
  task: {
    title: 'Como criar tarefas claras',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 11l3 3 5-5"/>
      </svg>
    ),
    sections: [
      {
        title: 'Título',
        body: 'Comece com verbo no infinitivo: "Revisar contrato", "Enviar proposta", "Aprovar peça". Evite "coisa do cliente".',
      },
      {
        title: 'Prioridade',
        body: '"Alta" = bloqueia outras coisas ou tem prazo apertado. "Média" = importante mas com folga. "Qualquer momento" = quando der.',
      },
      {
        title: 'Responsável',
        body: 'Uma tarefa sem dono não anda. Coloque quem vai executar, não quem pediu.',
      },
      {
        title: 'Data de execução vs Prazo',
        body: 'Execução = quando vai ser feita. Prazo = quando precisa estar pronto. Os dois podem ser diferentes.',
      },
      {
        title: 'Vincular a plano/milestone',
        body: 'Tarefas vinculadas a planos de ação ficam visíveis no calendário do plano. Use para tudo que faz parte de um esforço maior.',
      },
    ],
  },
}

export default function TipsPanel({ type }) {
  const content = tipSections[type]
  if (!content) return null

  return (
    <div
      className="rounded-lg p-4 flex flex-col gap-3"
      style={{
        background: 'rgba(255,255,255,.02)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="w-[24px] h-[24px] rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}
        >
          {content.icon}
        </span>
        <span className="text-[12px] font-bold tracking-wide" style={{ color: 'var(--color-text-primary)' }}>
          {content.title}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {content.sections.map((s, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              {s.title}
            </span>
            <p className="text-[11px] m-0 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
