'use client';

import { useEffect } from 'react';

export default function Home() {
  return (
    <div id="app" className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="logo">Lig. <span className="highlight">Resolve</span></div>
        <button id="mobile-menu-btn" className="hamburger">☰</button>
      </header>

      {/* Sidebar Overlay */}
      <div id="sidebar-overlay" className="sidebar-overlay"></div>

      {/* Auth View (Login) */}
      <div id="auth-view" className="view active-view">
        <div className="split-login-container glass-card">
          <div className="welcome-pane">
            <div className="welcome-content">
              <h1>Welcome back! <br/><span className="highlight">Ligeirinho Resolve</span></h1>
              <p>Acesse sua conta para gerenciar seus atendimentos com agilidade e precisão.</p>
              <div className="decor-pattern"></div>
            </div>
          </div>
          <div className="form-pane">
            <div className="auth-box">
              <h2>Login</h2>
              <form id="login-form">
                <div className="form-group">
                  <div className="input-with-icon">
                    <i className="fas fa-user"></i>
                    <input type="text" id="username" className="form-control" placeholder="Usuário" required />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <i className="fas fa-lock"></i>
                    <input type="password" id="password" className="form-control" placeholder="Senha" required />
                  </div>
                </div>
                <div className="form-options">
                  <label className="checkbox-container">
                    <input type="checkbox" /> Lembrar-me
                    <span className="checkmark"></span>
                  </label>
                </div>
                <button type="submit" className="btn btn-primary btn-block">Entrar</button>
                <div id="login-error" className="hidden error-msg">Usuário ou senha inválidos.</div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div id="dashboard-view" className="view hidden">
        <div className="main-layout">
          <aside id="sidebar" className="sidebar glass-panel">
            <div className="logo sidebar-logo">
              Lig. <span className="highlight">Resolve</span>
            </div>
            <nav className="sidebar-nav">
              <div className="nav-item active" data-target="dashboard-content"><i className="fas fa-chart-pie"></i><span>Dashboard</span></div>
              <div className="nav-item" data-target="clients-content"><i className="fas fa-users"></i><span>Clientes</span></div>
              <div className="nav-item" data-target="tickets-content"><i className="fas fa-headset"></i><span>Chamados</span></div>
              <div id="nav-categories-item" className="nav-item hidden" data-target="categories-content"><i className="fas fa-tags"></i><span>Categorias</span></div>
              <div id="nav-users-item" className="nav-item hidden" data-target="users-content"><i className="fas fa-user-shield"></i><span>Usuários</span></div>
              <div id="nav-reports-item" className="nav-item hidden" data-target="reports-content"><i className="fas fa-chart-line"></i><span>Relatórios</span></div>
            </nav>
            <div className="sidebar-footer">
              <div className="user-info">
                <div className="user-avatar" id="user-initial">U</div>
                <div className="user-details">
                  <span className="name" id="user-fullname">Usuário</span>
                  <span className="role" id="user-role">Nível</span>
                </div>
                <button id="btn-logout" className="btn-logout" title="Sair"><i className="fas fa-sign-out-alt"></i></button>
              </div>
            </div>
          </aside>

          <main className="content-area">
            <section id="dashboard-content" className="content-section">
              <div className="content-header">
                <h1>Dashboard</h1>
                <div className="header-actions">
                  <button type="button" className="btn btn-primary" onClick={() => window.openNewTicketModal && window.openNewTicketModal()}>+ Novo Chamado</button>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card glass-card open">
                  <div className="stat-card-header">
                    <h3>Chamados Abertos</h3>
                    <div className="stat-card-icon"><i className="fas fa-envelope-open-text"></i></div>
                  </div>
                  <div className="stat-card-value" id="stat-open">0</div>
                </div>
                <div className="stat-card glass-card in_progress">
                  <div className="stat-card-header">
                    <h3>Em Andamento</h3>
                    <div className="stat-card-icon"><i className="fas fa-spinner fa-spin-pulse"></i></div>
                  </div>
                  <div className="stat-card-value" id="stat-progress">0</div>
                </div>
                <div className="stat-card glass-card closed">
                  <div className="stat-card-header">
                    <h3>Concluídos</h3>
                    <div className="stat-card-icon"><i className="fas fa-check-double"></i></div>
                  </div>
                  <div className="stat-card-value" id="stat-closed">0</div>
                </div>
                <div className="stat-card glass-card total">
                  <div className="stat-card-header">
                    <h3>Total de Clientes</h3>
                    <div className="stat-card-icon"><i className="fas fa-address-book"></i></div>
                  </div>
                  <div className="stat-card-value" id="stat-clients">0</div>
                </div>
              </div>
              <div className="glass-card">
                <h2 style={{ marginBottom: '1.5rem' }}>Chamados Recentes</h2>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Cliente</th>
                        <th>Finalizador</th>
                        <th>Status</th>
                        <th>Data</th>
                      </tr>
                    </thead>
                    <tbody id="recent-tickets-body"></tbody>
                  </table>
                </div>
              </div>
            </section>

            <section id="clients-content" className="content-section hidden">
              <div className="content-header">
                <h1>Gerenciar Clientes</h1>
                <button type="button" className="btn btn-primary" onClick={() => window.openClientModal && window.openClientModal()}>+ Cadastrar Cliente</button>
              </div>
              <div className="table-container glass-card">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Telefone</th>
                      <th>Documento</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody id="clients-table-body"></tbody>
                </table>
              </div>
            </section>

            <section id="tickets-content" className="content-section hidden">
              <div className="content-header">
                <h1>Gerenciar Chamados</h1>
                <div className="header-actions row" style={{ gap: '10px' }}>
                  <select id="status-filter" className="form-control" style={{ width: 'auto' }}>
                    <option value="todos">Todos os status</option>
                    <option value="open">Aberto</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="closed">Concluído</option>
                  </select>
                </div>
              </div>
              <div className="table-container glass-card">
                <table className="table" id="tickets-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Cliente</th>
                      <th>Responsável</th>
                      <th>Finalizador</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody id="tickets-table-body"></tbody>
                </table>
              </div>
              <div id="tickets-pagination" className="pagination-container"></div>
            </section>

            <section id="categories-content" className="content-section hidden">
              <div className="content-header">
                <h1><i className="fas fa-tags" style={{ marginRight: '0.5rem', color: 'var(--accent-color)' }}></i>Categorias</h1>
                <button type="button" className="btn btn-primary" onClick={() => window.openCategoryModal && window.openCategoryModal()}><i className="fas fa-plus" style={{ marginRight: '0.4rem' }}></i>Nova Categoria</button>
              </div>
              <div className="categories-grid">
                <div className="glass-card cat-panel">
                  <div className="cat-panel-header">
                    <div>
                      <h4><i className="fas fa-layer-group" style={{ marginRight: '0.5rem', opacity: 0.7 }}></i>Categorias</h4>
                      <p style={{ margin: 0, fontSize: 0.8, color: 'var(--text-secondary)' }}>Clique para ver subcategorias</p>
                    </div>
                  </div>
                  <div id="category-list" className="category-list"></div>
                </div>
                <div className="glass-card cat-panel">
                  <div className="cat-panel-header">
                    <div>
                      <h4 id="subcategory-panel-title"><i className="fas fa-list-ul" style={{ marginRight: '0.5rem', opacity: 0.7 }}></i>Subcategorias</h4>
                      <p style={{ margin: 0, fontSize: 0.8, color: 'var(--text-secondary)' }} id="subcategory-panel-hint">Selecione uma categoria</p>
                    </div>
                    <button type="button" id="btn-new-subcategory" className="btn btn-primary btn-sm hidden" onClick={() => window.openSubcategoryModal && window.openSubcategoryModal()}><i className="fas fa-plus"></i> Nova</button>
                  </div>
                  <div id="subcategory-list-content">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', opacity: 0.4 }}>
                      <i className="fas fa-hand-point-left" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}></i>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>Selecione uma categoria ao lado</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="users-content" className="content-section hidden">
              <div className="content-header">
                <h1>Gerenciar Usuários</h1>
                <button type="button" className="btn btn-primary" onClick={() => window.openUserModal && window.openUserModal()}>+ Novo Usuário</button>
              </div>
              <div className="table-container glass-card">
                <table className="table">
                  <thead>
                    <tr>
                      <th>NOME</th>
                      <th>USUÁRIO</th>
                      <th>CARGO</th>
                      <th>AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody id="users-table-body"></tbody>
                </table>
              </div>
            </section>

            <section id="reports-content" className="content-section hidden">
              <div className="content-header">
                <h1>Relatórios Analíticos</h1>
              </div>
              <div className="glass-card" style={{ marginBottom: '2rem' }}>
                <form id="report-filter-form">
                  <div className="filters-grid">
                    <div className="form-group">
                      <label>Início</label>
                      <input type="date" id="rep-date-start" className="form-control" />
                    </div>
                    <div className="form-group">
                      <label>Fim</label>
                      <input type="date" id="rep-date-end" className="form-control" />
                    </div>
                    <div className="form-group">
                      <label>Operador</label>
                      <select id="rep-operator" className="form-control">
                        <option value="">Todos</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Cliente</label>
                      <select id="rep-client" className="form-control">
                        <option value="">Todos</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Categoria</label>
                      <select id="rep-category" className="form-control">
                        <option value="">Todas</option>
                      </select>
                    </div>
                  </div>
                  <div className="filter-actions-container">
                    <button type="submit" className="btn btn-primary" title="Filtrar Resultados"><i className="fas fa-search"></i> Filtrar</button>
                    <button type="button" id="btn-generate-pdf" className="btn btn-success" title="Gerar PDF da Tabela"><i className="fas fa-file-pdf"></i> Tabela</button>
                    <button type="button" id="btn-generate-charts-pdf" className="btn btn-secondary" title="Gerar PDF dos Gráficos"><i className="fas fa-chart-bar"></i> Gráficos</button>
                  </div>
                </form>
              </div>
              <div className="table-container glass-card">
                <table className="table" id="reports-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Cliente</th>
                      <th>Criador</th>
                      <th>Finalizador</th>
                      <th>Status</th>
                      <th>Data</th>
                    </tr>
                  </thead>
                  <tbody></tbody>
                </table>
              </div>
              <div className="stats-grid" id="report-stats-container" style={{ marginTop: '2rem', marginBottom: '2.5rem', display: 'none' }}>
                <div className="stat-card glass-card total">
                  <div className="stat-card-header">
                    <h3>Total no Período</h3>
                    <div className="stat-card-icon"><i className="fas fa-list-ul"></i></div>
                  </div>
                  <div className="stat-card-value" id="rep-stat-total">0</div>
                </div>
                <div className="stat-card glass-card closed">
                  <div className="stat-card-header">
                    <h3>Concluídos</h3>
                    <div className="stat-card-icon"><i className="fas fa-check-double"></i></div>
                  </div>
                  <div className="stat-card-value" id="rep-stat-closed">0</div>
                </div>
                <div className="stat-card glass-card open">
                  <div className="stat-card-header">
                    <h3>Pendentes</h3>
                    <div className="stat-card-icon"><i className="fas fa-clock"></i></div>
                  </div>
                  <div className="stat-card-value" id="rep-stat-open">0</div>
                </div>
              </div>
              <div id="report-charts-view" className="report-view">
                <div className="charts-grid">
                  <div className="chart-container glass-card">
                    <h3>Desempenho por Operador</h3>
                    <div className="chart-wrapper"><canvas id="chart-operators"></canvas></div>
                  </div>
                  <div className="chart-container glass-card">
                    <h3>Volume por Cliente</h3>
                    <div className="chart-wrapper"><canvas id="chart-clients"></canvas></div>
                  </div>
                  <div className="chart-container glass-card">
                    <h3>Distribuição por Categoria</h3>
                    <div className="chart-wrapper"><canvas id="chart-categories"></canvas></div>
                  </div>
                  <div className="chart-container glass-card">
                    <h3>Distribuição por Subcategoria</h3>
                    <div className="chart-wrapper"><canvas id="chart-subcategories"></canvas></div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Modals */}
      <div id="client-modal" className="modal-overlay hidden">
        <div className="modal-content glass-card">
          <div className="modal-header">
            <h3 id="client-modal-title">Novo Cliente</h3>
            <button className="close-modal">&times;</button>
          </div>
          <form id="client-form">
            <input type="hidden" id="client-id" />
            <div className="form-group">
              <label>Nome</label>
              <input type="text" id="client-name" className="form-control" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" id="client-email" className="form-control" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Telefone</label>
                <input type="text" id="client-phone" className="form-control" />
              </div>
              <div className="form-group">
                <label>Documento (CPF/CNPJ)</label>
                <input type="text" id="client-document" className="form-control" />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-text close-modal">Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Cliente</button>
            </div>
          </form>
        </div>
      </div>

      <div id="ticket-modal" className="modal-overlay hidden">
        <div className="modal-content glass-card">
          <div className="modal-header">
            <h3 id="ticket-modal-title">Novo Chamado</h3>
            <button className="close-modal">&times;</button>
          </div>
          <form id="ticket-form">
            <input type="hidden" id="ticket-id" />
            <div className="form-group">
              <label>Título / Assunto</label>
              <input type="text" id="ticket-title" className="form-control" required />
            </div>
            <div className="form-group">
              <label>Cliente</label>
              <select id="ticket-client" className="form-control" required>
                <option value="">Selecione um cliente...</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Categoria</label>
                <select id="ticket-category" className="form-control" required>
                  <option value="">Selecione...</option>
                </select>
              </div>
              <div className="form-group">
                <label>Subcategoria</label>
                <select id="ticket-subcategory" className="form-control" required disabled>
                  <option value="">Aguardando categoria...</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea id="ticket-desc" className="form-control" rows={4} required></textarea>
            </div>
            <div className="form-group" id="ticket-status-group">
              <label>Status</label>
              <select id="ticket-status" className="form-control">
                <option value="open">Aberto</option>
                <option value="in_progress">Em Andamento</option>
                <option value="closed">Concluído</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-text close-modal">Cancelar</button>
              <button type="submit" className="btn btn-primary">Salvar Chamado</button>
            </div>
          </form>
        </div>
      </div>

      <div id="attendance-modal" className="modal-overlay hidden">
        <div className="modal-content glass-card attendance-card">
          <div className="modal-header">
            <h3>Atendimento do Chamado <span id="att-ticket-id" className="highlight">#0</span></h3>
            <button className="close-modal">&times;</button>
          </div>
          <div className="attendance-body">
            <div className="ticket-info-header">
              <h4 id="att-ticket-title">Título do Chamado</h4>
              <div className="meta">
                <span id="att-ticket-client">👤 Cliente: -</span>
                <span id="att-ticket-status-badge" className="badge">Aberto</span>
                <span id="att-ticket-finalizer" className="text-success hidden">✅ Finalizado por: -</span>
              </div>
              <p id="att-ticket-desc" className="description">Descrição completa...</p>
            </div>
            <div className="attendance-actions-bar" id="attendance-main-actions">
              <button id="start-attendance-btn" className="btn btn-primary">▶ Iniciar Atendimento</button>
              <button id="finish-attendance-btn" className="btn btn-success hidden">✅ Finalizar Chamado</button>
            </div>
            <div className="timeline-container">
              <h5>Histórico / Comentários</h5>
              <div id="ticket-timeline" className="timeline"></div>
            </div>
            <div className="comment-section" id="comment-section-box">
              <form id="comment-form">
                <div className="input-group">
                  <textarea id="comment-msg" placeholder="Escreva um comentário ou registro..." rows={2}></textarea>
                </div>
                <div className="comment-footer">
                  <div className="file-input-wrapper">
                    <label htmlFor="comment-photo" className="btn btn-secondary btn-sm">📷 Anexar Foto</label>
                    <input type="file" id="comment-photo" accept="image/*" className="hidden" />
                    <span id="file-name-preview" className="file-preview"></span>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">Enviar Registro</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div id="user-modal" className="modal-overlay hidden">
        <div className="modal-content glass-card">
          <div className="modal-header">
            <h3 id="user-modal-title">Configurar Usuário</h3>
            <button className="close-modal">&times;</button>
          </div>
          <form id="user-form">
            <input type="hidden" id="manage-user-id" />
            <div className="modal-form-group">
              <label><i className="fas fa-id-card"></i> Nome Completo</label>
              <input type="text" id="manage-user-name" className="form-control" placeholder="Ex: João Silva" required />
            </div>
            <div className="modal-form-group">
              <label><i className="fas fa-user"></i> Usuário (Login)</label>
              <input type="text" id="manage-user-username" className="form-control" placeholder="Ex: joaosilva" required />
            </div>
            <div className="modal-form-group">
              <label><i className="fas fa-user-tag"></i> Cargo / Função</label>
              <select id="manage-user-role" className="form-control">
                <option value="employee">Operador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div style={{ margin: '1.5rem 0', borderTop: '1px dashed var(--glass-border)' }}></div>
            <div className="modal-form-group">
              <label id="lbl-manage-password"><i className="fas fa-key"></i> Senha</label>
              <input type="password" id="manage-user-password" className="form-control" placeholder="••••••••" />
              <small id="help-manage-password" style={{ display: 'block', marginTop: '0.4rem', opacity: 0.6, fontSize: '0.75rem' }}></small>
            </div>
            <div className="modal-actions" style={{ marginTop: '2rem' }}>
              <button type="button" className="btn btn-text close-modal">Cancelar</button>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>

      <div id="finish-modal" className="modal-overlay hidden">
        <div className="modal-content glass-card" style={{ maxWidth: '520px' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-check" style={{ color: 'var(--success)', fontSize: '0.9rem' }}></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Finalizar Chamado <span id="finish-ticket-id" className="highlight">#0</span></h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Esta ação irá marcar o chamado como concluído</p>
              </div>
            </div>
            <button className="close-modal">&times;</button>
          </div>
          <form id="finish-form">
            <div className="form-group">
              <label><i className="fas fa-comment-alt" style={{ marginRight: '0.4rem', opacity: 0.7 }}></i>Solução Final / Comentários</label>
              <textarea id="finish-message" className="form-control" placeholder="Descreva o que foi feito para resolver o chamado..." required rows={4} style={{ resize: 'vertical' }}></textarea>
            </div>
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label><i className="fas fa-camera" style={{ marginRight: '0.4rem', opacity: 0.7 }}></i>Foto da Finalização <span style={{ fontWeight: 400, opacity: 0.6 }}>(opcional)</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem', background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--glass-border)', borderRadius: '10px' }}>
                <label htmlFor="finish-photo" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}><i className="fas fa-upload" style={{ marginRight: '0.4rem' }}></i>Selecionar</label>
                <input type="file" id="finish-photo" accept="image/*" className="hidden" />
                <span id="finish-file-preview" className="file-preview" style={{ fontSize: '0.8rem', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis' }}>Nenhum arquivo selecionado</span>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '2rem', gap: '0.75rem' }}>
              <button type="button" className="btn btn-text close-modal">Cancelar</button>
              <button type="submit" className="btn btn-success" style={{ minWidth: '150px' }}><i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i>Concluir Chamado</button>
            </div>
          </form>
        </div>
      </div>

      <div id="category-modal" className="modal-overlay hidden">
        <div className="modal-content glass-card" style={{ maxWidth: '420px' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-tag" style={{ color: 'var(--accent-color)', fontSize: '0.85rem' }}></i>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Nova Categoria</h3>
            </div>
            <button className="close-modal">&times;</button>
          </div>
          <form id="category-form">
            <div className="form-group">
              <label><i className="fas fa-font" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Nome da Categoria</label>
              <input type="text" id="category-name" className="form-control" required placeholder="Ex: Hardware, Redes, Software..." autoFocus />
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-text close-modal">Cancelar</button>
              <button type="submit" className="btn btn-primary"><i className="fas fa-save" style={{ marginRight: '0.4rem' }}></i>Salvar Categoria</button>
            </div>
          </form>
        </div>
      </div>

      <div id="subcategory-modal" className="modal-overlay hidden">
        <div className="modal-content glass-card" style={{ maxWidth: '420px' }}>
          <div className="modal-header" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-list-ul" style={{ color: 'var(--accent-color)', fontSize: '0.8rem' }}></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Nova Subcategoria</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }} id="subcategory-modal-hint">Selecione a categoria pai</p>
              </div>
            </div>
            <button className="close-modal">&times;</button>
          </div>
          <form id="subcategory-form">
            <div className="form-group">
              <label><i className="fas fa-font" style={{ marginRight: '0.4rem', opacity: 0.6 }}></i>Nome da Subcategoria</label>
              <input type="text" id="subcategory-name" className="form-control" required placeholder="Ex: Mouse, Wi-Fi, Impressora..." autoFocus />
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-text close-modal">Cancelar</button>
              <button type="submit" className="btn btn-primary"><i className="fas fa-save" style={{ marginRight: '0.4rem' }}></i>Salvar Subcategoria</button>
            </div>
          </form>
        </div>
      </div>

      <div id="chart-export-modal" className="modal-overlay hidden">
        <div className="modal-content glass-card" style={{ maxWidth: '450px' }}>
          <div className="modal-header">
            <h3>Personalizar Exportação</h3>
            <button className="close-modal">&times;</button>
          </div>
          <div className="modal-body" style={{ padding: '20px' }}>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>Escolha os itens que deseja incluir no PDF:</p>
            <div className="check-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" id="chk-op-perf" defaultChecked /> Desempenho por Operador
              </label>
            </div>
            <div className="check-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" id="chk-cli-vol" defaultChecked /> Volume por Cliente
              </label>
            </div>
            <div className="check-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" id="chk-cat-dist" defaultChecked /> Distribuição por Categoria
              </label>
            </div>
            <div className="check-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" id="chk-sub-dist" defaultChecked /> Distribuição por Subcategoria
              </label>
            </div>
            <div className="check-group" style={{ marginBottom: '25px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" id="chk-stats-table" defaultChecked /> Tabelas de Resumo (Dados)
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-text close-modal">Cancelar</button>
              <button type="button" id="btn-confirm-export" className="btn btn-primary">Gerar PDF</button>
            </div>
          </div>
        </div>
      </div>

      <div id="confirm-modal" className="modal-overlay hidden" style={{ zIndex: 9999 }}>
        <div className="modal-content glass-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
          <h3 id="confirm-modal-title" style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Confirmação</h3>
          <p id="confirm-modal-msg" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>Tem certeza?</p>
          <div className="modal-actions" style={{ justifyContent: 'center', gap: '1rem' }}>
            <button type="button" className="btn btn-text close-modal" id="btn-confirm-cancel">Cancelar</button>
            <button type="button" className="btn btn-primary" id="btn-confirm-yes" style={{ background: 'var(--danger)' }}>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
