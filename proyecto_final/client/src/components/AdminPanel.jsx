import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  CircularProgress
} from "@mui/material";
import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Email as EmailIcon
} from "@mui/icons-material";
import { ToastContainer, useToast } from "../components/Toast";
import { COLORS } from "../utils/colors";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminPanel() {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const { toasts, showToast, removeToast, closeToast } = useToast();

  // Estados para diálogos
  const [blockDialog, setBlockDialog] = useState({ open: false, user: null });
  const [changePasswordDialog, setChangePasswordDialog] = useState({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [newPassword, setNewPassword] = useState("");

  // Estados para menú contextual
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, statsResponse] = await Promise.all([
        axios.get("http://localhost:3000/api/admin/users"),
        axios.get("http://localhost:3000/api/admin/users/stats")
      ]);

      setUsers(usersResponse.data);
      setUserStats(statsResponse.data);
    } catch (error) {
      showToast("Error al cargar datos del panel", "error", 4000);
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleBlockUser = async () => {
    try {
      const endpoint = blockDialog.user.estado === 'activo'
        ? `http://localhost:3000/api/admin/users/${blockDialog.user.id}/block`
        : `http://localhost:3000/api/admin/users/${blockDialog.user.id}/unblock`;

      await axios.put(endpoint);
      showToast(
        blockDialog.user.estado === 'activo'
          ? "Usuario bloqueado exitosamente"
          : "Usuario desbloqueado exitosamente",
        "success",
        3000
      );

      fetchData();
      setBlockDialog({ open: false, user: null });
    } catch (error) {
      showToast("Error al cambiar estado del usuario", "error", 3000);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      showToast("La contraseña debe tener al menos 6 caracteres", "error", 3000);
      return;
    }

    try {
      await axios.put(`http://localhost:3000/api/admin/users/${changePasswordDialog.user.id}/change-password`, {
        newPassword
      });

      showToast("Contraseña cambiada exitosamente", "success", 3000);
      setChangePasswordDialog({ open: false, user: null });
      setNewPassword("");
    } catch (error) {
      showToast("Error al cambiar contraseña", "error", 3000);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/admin/users/${deleteDialog.user.id}`);
      showToast("Usuario eliminado exitosamente", "success", 3000);

      fetchData();
      setDeleteDialog({ open: false, user: null });
    } catch (error) {
      showToast("Error al eliminar usuario", "error", 3000);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'activo': return 'success';
      case 'inactivo': return 'error';
      case 'suspendido': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} closeToast={closeToast} />

      <Box sx={{
        bgcolor: COLORS.fondoClaro,
        minHeight: '100vh',
        p: 2
      }}>
        <Paper sx={{ mb: 3, overflow: 'hidden' }}>
          <Box sx={{
            bgcolor: COLORS.primary,
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SecurityIcon sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Panel de Administración
                </Typography>
                <Typography variant="subtitle1" opacity={0.9}>
                  Gestión de usuarios y seguridad
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={fetchData}
              sx={{ color: 'white' }}
              title="Actualizar datos"
            >
              <RefreshIcon />
            </IconButton>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
              <Tab label="Estadísticas" icon={<PeopleIcon />} iconPosition="start" />
              <Tab label="Gestión de Usuarios" icon={<PeopleIcon />} iconPosition="start" />
            </Tabs>
          </Box>
        </Paper>

        {/* Tab de Estadísticas */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {userStats && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Usuarios
                      </Typography>
                      <Typography variant="h4" component="div">
                        {userStats.totalUsers}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Usuarios Activos
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ color: 'success.main' }}>
                        {userStats.activeUsers}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Usuarios Inactivos
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ color: 'error.main' }}>
                        {userStats.inactiveUsers}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Administradores
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ color: 'warning.main' }}>
                        {userStats.adminUsers}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>
        </TabPanel>

        {/* Tab de Gestión de Usuarios */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: COLORS.primary }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuario</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rol</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Último Acceso</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box>
                        <Typography fontWeight="600">
                          {user.username}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        {user.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.estado}
                        color={getStatusColor(user.estado)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isAdmin ? 'Administrador' : 'Usuario'}
                        color={user.isAdmin ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.ultimaSesion ? formatDate(user.ultimaSesion) : 'Nunca'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, user)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Menú contextual */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {selectedUser && (
              <>
                <MenuItem
                  onClick={() => {
                    setBlockDialog({ open: true, user: selectedUser });
                    handleMenuClose();
                  }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  {selectedUser.estado === 'activo' ? (
                    <>
                      <BlockIcon fontSize="small" color="error" />
                      Bloquear Usuario
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon fontSize="small" color="success" />
                      Activar Usuario
                    </>
                  )}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setChangePasswordDialog({ open: true, user: selectedUser });
                    handleMenuClose();
                  }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <SecurityIcon fontSize="small" />
                  Cambiar Contraseña
                </MenuItem>
                {!selectedUser.isAdmin && (
                  <MenuItem
                    onClick={() => {
                      setDeleteDialog({ open: true, user: selectedUser });
                      handleMenuClose();
                    }}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                    Eliminar Usuario
                  </MenuItem>
                )}
              </>
            )}
          </Menu>
        </TabPanel>
      </Box>

      {/* Diálogo de bloquear/desbloquear usuario */}
      <Dialog
        open={blockDialog.open}
        onClose={() => setBlockDialog({ open: false, user: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {blockDialog.user?.estado === 'activo' ? 'Bloquear Usuario' : 'Activar Usuario'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {blockDialog.user?.estado === 'activo'
              ? `¿Estás seguro de bloquear al usuario ${blockDialog.user?.username}? El usuario no podrá iniciar sesión.`
              : `¿Estás seguro de activar al usuario ${blockDialog.user?.username}? El usuario podrá volver a iniciar sesión.`}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialog({ open: false, user: null })}>
            Cancelar
          </Button>
          <Button
            onClick={handleBlockUser}
            variant="contained"
            color={blockDialog.user?.estado === 'activo' ? 'error' : 'success'}
          >
            {blockDialog.user?.estado === 'activo' ? 'Bloquear' : 'Activar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de cambiar contraseña */}
      <Dialog
        open={changePasswordDialog.open}
        onClose={() => {
          setChangePasswordDialog({ open: false, user: null });
          setNewPassword("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Establecer una nueva contraseña para el usuario: <strong>{changePasswordDialog.user?.username}</strong>
          </Alert>
          <TextField
            fullWidth
            label="Nueva Contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
            helperText="Mínimo 6 caracteres"
            inputProps={{ minLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setChangePasswordDialog({ open: false, user: null });
            setNewPassword("");
          }}>
            Cancelar
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            color="primary"
            disabled={!newPassword || newPassword.length < 6}
          >
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de eliminar usuario */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eliminar Usuario</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            ⚠️ ADVERTENCIA: Esta acción no se puede deshacer.
            <br /><br />
            ¿Estás seguro de eliminar permanentemente al usuario <strong>{deleteDialog.user?.username}</strong>?
            <br />
            Todos sus datos serán eliminados de forma irreversible.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
          >
            Eliminar Permanentemente
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}