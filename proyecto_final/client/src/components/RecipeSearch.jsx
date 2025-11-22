// src/components/RecipeSearch.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Slider,
  Typography,
  IconButton,
  Collapse,
  Badge
} from '@mui/material';
import {
  Search,
  Filter,
  Clock,
  Users,
  Flame,
  DollarSign,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import axios from 'axios';
import { COLORS } from '../utils/colors';

export default function RecipeSearch({ onSearch, loading }) {
  const [categories, setCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    cocina: '',
    dificultad: '',
    tiempoMax: 60,
    caloriasMax: 500,
    costoMax: 1000,
    page: 1,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    loadCategories();
    loadCuisines();
  }, []);

  useEffect(() => {
    // Contar filtros activos
    let count = 0;
    if (filters.search) count++;
    if (filters.categoria) count++;
    if (filters.cocina) count++;
    if (filters.dificultad) count++;
    if (filters.tiempoMax < 120) count++;
    if (filters.caloriasMax < 1000) count++;
    if (filters.costoMax < 5000) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const loadCuisines = async () => {
    try {
      const response = await axios.get('http://localhost:3000/cuisines');
      setCuisines(response.data);
    } catch (error) {
      console.error('Error al cargar cocinas:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      search: '',
      categoria: '',
      cocina: '',
      dificultad: '',
      tiempoMax: 60,
      caloriasMax: 500,
      costoMax: 1000,
      page: 1,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    };
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  const difficulties = [
    { value: 'facil', label: 'Fácil', color: COLORS.success },
    { value: 'medio', label: 'Medio', color: COLORS.warning },
    { value: 'dificil', label: 'Difícil', color: COLORS.error }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Más recientes' },
    { value: 'titulo', label: 'Alfabético (A-Z)' },
    { value: 'tiempoPreparacion', label: 'Más rápidas' },
    { value: 'calorias', label: 'Menos calorías' },
    { value: 'costo', label: 'Más económicas' }
  ];

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      {/* Búsqueda principal */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="🔍 Buscar recetas, ingredientes..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: <Search className="w-4 h-4 mr-2 text-gray-400" />
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: COLORS.principal },
                '&.Mui-focused fieldset': { borderColor: COLORS.principal }
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={filters.categoria}
              onChange={(e) => handleFilterChange('categoria', e.target.value)}
              label="Categoría"
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Cocina</InputLabel>
            <Select
              value={filters.cocina}
              onChange={(e) => handleFilterChange('cocina', e.target.value)}
              label="Cocina"
            >
              <MenuItem value="">Todas</MenuItem>
              {cuisines.map(cuisine => (
                <MenuItem key={cuisine.id} value={cuisine.id}>
                  {cuisine.flag && `${cuisine.flag} `}{cuisine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={1}>
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            fullWidth
            sx={{
              height: '100%',
              bgcolor: COLORS.principal,
              '&:hover': { bgcolor: COLORS.oscuro }
            }}
          >
            Buscar
          </Button>
        </Grid>
      </Grid>

      {/* Filtros avanzados */}
      <Box sx={{ mt: 2 }}>
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          sx={{ textTransform: 'none', mb: 1 }}
          startIcon={
            <Badge badgeContent={activeFiltersCount} color="primary">
              <Filter className="w-4 h-4" />
            </Badge>
          }
          endIcon={showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        >
          Filtros avanzados
        </Button>

        <Collapse in={showAdvanced}>
          <Box sx={{ mt: 2, p: 2, bgcolor: COLORS.fondoClaro, borderRadius: 2 }}>
            <Grid container spacing={3}>
              {/* Primera fila de filtros */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Dificultad
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {difficulties.map(diff => (
                    <Chip
                      key={diff.value}
                      label={diff.label}
                      onClick={() => handleFilterChange(
                        'dificultad',
                        filters.dificultad === diff.value ? '' : diff.value
                      )}
                      sx={{
                        bgcolor: filters.dificultad === diff.value ? diff.color : 'default',
                        color: filters.dificultad === diff.value ? 'white' : 'inherit',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Tiempo máximo: {filters.tiempoMax} min
                </Typography>
                <Slider
                  value={filters.tiempoMax}
                  onChange={(e, value) => handleFilterChange('tiempoMax', value)}
                  min={5}
                  max={180}
                  step={5}
                  marks={[
                    { value: 5, label: '5m' },
                    { value: 30, label: '30m' },
                    { value: 60, label: '1h' },
                    { value: 120, label: '2h' },
                    { value: 180, label: '3h' }
                  ]}
                  sx={{
                    '& .MuiSlider-thumb': { bgcolor: COLORS.principal },
                    '& .MuiSlider-track': { bgcolor: COLORS.principal },
                    '& .MuiSlider-rail': { bgcolor: COLORS.divider }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Ordenar por
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={`${filters.sortBy}_${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('_');
                      setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                    }}
                  >
                    {sortOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Segunda fila de filtros */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  <Flame className="w-4 h-4 inline mr-1" />
                  Calorías máximas: {filters.caloriasMax}
                </Typography>
                <Slider
                  value={filters.caloriasMax}
                  onChange={(e, value) => handleFilterChange('caloriasMax', value)}
                  min={50}
                  max={2000}
                  step={50}
                  marks={[
                    { value: 50, label: '50' },
                    { value: 500, label: '500' },
                    { value: 1000, label: '1k' },
                    { value: 1500, label: '1.5k' },
                    { value: 2000, label: '2k' }
                  ]}
                  sx={{
                    '& .MuiSlider-thumb': { bgcolor: COLORS.error },
                    '& .MuiSlider-track': { bgcolor: COLORS.error },
                    '& .MuiSlider-rail': { bgcolor: COLORS.divider }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Costo máximo: ${filters.costoMax}
                </Typography>
                <Slider
                  value={filters.costoMax}
                  onChange={(e, value) => handleFilterChange('costoMax', value)}
                  min={100}
                  max={5000}
                  step={100}
                  marks={[
                    { value: 100, label: '$100' },
                    { value: 1000, label: '$1k' },
                    { value: 2000, label: '$2k' },
                    { value: 5000, label: '$5k' }
                  ]}
                  sx={{
                    '& .MuiSlider-thumb': { bgcolor: COLORS.success },
                    '& .MuiSlider-track': { bgcolor: COLORS.success },
                    '& .MuiSlider-rail': { bgcolor: COLORS.divider }
                  }}
                />
              </Grid>

              {/* Botones de acción */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={handleClearFilters}
                    startIcon={<X className="w-4 h-4" />}
                    sx={{ textTransform: 'none' }}
                  >
                    Limpiar filtros
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={loading}
                    sx={{
                      bgcolor: COLORS.principal,
                      '&:hover': { bgcolor: COLORS.oscuro },
                      textTransform: 'none'
                    }}
                  >
                    Aplicar filtros
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Box>

      {/* Resumen de filtros activos */}
      {activeFiltersCount > 0 && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {filters.search && (
            <Chip
              label={`Búsqueda: ${filters.search}`}
              onDelete={() => handleFilterChange('search', '')}
              size="small"
            />
          )}
          {filters.categoria && (
            <Chip
              label={`Categoría: ${categories.find(c => c.id === filters.categoria)?.name || filters.categoria}`}
              onDelete={() => handleFilterChange('categoria', '')}
              size="small"
            />
          )}
          {filters.cocina && (
            <Chip
              label={`Cocina: ${cuisines.find(c => c.id === filters.cocina)?.name || filters.cocina}`}
              onDelete={() => handleFilterChange('cocina', '')}
              size="small"
            />
          )}
          {filters.dificultad && (
            <Chip
              label={`Dificultad: ${difficulties.find(d => d.value === filters.dificultad)?.label || filters.dificultad}`}
              onDelete={() => handleFilterChange('dificultad', '')}
              size="small"
            />
          )}
        </Box>
      )}
    </Paper>
  );
}