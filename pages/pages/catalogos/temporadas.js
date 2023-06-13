import React, { useEffect, useState, useRef } from "react";
import Layout from "@/layout/layout"
import axios from "axios";
//--> Componentes primeReact
import { Tag } from 'primereact/tag';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Message } from 'primereact/message';

//--> Funciones propias
import { temporadaVacia } from "@/components/catalogos/objetovacio";
import { formatoPrecio } from "@/helpers/funciones";
import { camposVacios, descripcionInvalida, descuendoInvalido, nombreInvalido } from "@/helpers/constantes/mensajes";
import { listaTipos } from "@/components/catalogos/listas";
import { eliminarTemporada, listaFlores, listaPeluches, modificarTemporada, nuevaTemporada, verTemporadas } from "@/helpers/constantes/links";
import { alfaNumericoEspacios, descuento } from "@/helpers/constantes/expresionesregulares";
import { categoriaFlores, categoriaPeluches } from "@/helpers/dropproductos";

const Temporadas = () => {
  // --> Estructura de objetos
  let productoVacio = temporadaVacia
  const listaCategoriasFlores = categoriaFlores
  const listaCategoriasPeluches = categoriaPeluches

  // --> Validar cualquier string 
  const validarString = alfaNumericoEspacios
  const validarDescuento = descuento

  //----------------| Lista de variables |----------------
  //--> Registros
  const [product, setProduct] = useState(productoVacio);
  const [products, setProducts] = useState(null);
  //--> Lista de dropdowns
  const [floresDrop, setFloresDrop] = useState([]);
  const [peluchesDrop, setPeluchesDrop] = useState([]);
  //--> Edicion
  const [nombreNuevo, setNombreNuevo] = useState('')
  //--> Dialogos
  const [productDialog, setProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  //--> Estilos
  const [estiloNombre, setEstiloNombre] = useState('')
  const [estiloDescripcion, setEstiloDescripcion] = useState('')
  const [estiloPeluches, setEstiloPeluches] = useState('')
  const [estiloDescuento, setEstiloDescuento] = useState('')
  const [estiloFlores, setEstiloFlores] = useState('')
  //--> Otros
  const [editar, setEditar] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState(null);
  const [globalFilter, setGlobalFilter] = useState(null);
  //--> Mensajes
  const [mensajeRespuesta, setMensajeRespuesta] = useState('')
  //--> Especiales
  const toast = useRef(null);
  const dt = useRef(null);

  //----------------| Interaccion con back-end |----------------
  //--> GET
  const obtenerProductos = async () => {
    console.log("Obteniendo productos...")
    try {
      const datos = await axios.get(verTemporadas)
      // console.log(datos.data.seasons)
      setProducts(datos.data.seasons)
    } catch (error) { console.log(error) }
  }

  //--> POST
  const crearProducto = async (productoNuevo) => {
    console.log("Creando producto...")
    //--> Validar campos llenos
    if (Object.values(productoNuevo).includes('')) {
      if (!productoNuevo.nombreTemporada) setEstiloNombre('p-invalid')
      if (!productoNuevo.descrTemporada) setEstiloDescripcion('p-invalid')
      if (!productoNuevo.peluches) setEstiloPeluches('p-invalid')
      if (!productoNuevo.flores) setEstiloFlores('p-invalid')
      setMensajeRespuesta(camposVacios)
      setTimeout(() => { setMensajeRespuesta('') }, 3000)
      return
    } else {
      setEstiloNombre('')
      setEstiloDescripcion('')
      setEstiloPeluches('')
      setEstiloFlores('')
    }
    //--> Validar Nombre
    if (!validarString.test(productoNuevo.nombreTemporada)) {
      setEstiloNombre('p-invalid')
      setMensajeRespuesta(nombreInvalido)
      setTimeout(() => { setMensajeRespuesta('') }, 3000)
      return
    } else {
      setEstiloNombre('')
      setMensajeRespuesta('')
    }
    //--> Validar descripción
    if (!validarString.test(productoNuevo.descrTemporada)) {
      setEstiloDescripcion('p-invalid')
      setMensajeRespuesta(descripcionInvalida)
      setTimeout(() => { setMensajeRespuesta('') }, 3000)
      return
    } else {
      setEstiloDescripcion('')
      setMensajeRespuesta('')
    }
    //--> Validar descuento
    if (!validarDescuento.test(productoNuevo.descuentoTemporada)) {
      setEstiloDescuento('p-invalid')
      setMensajeRespuesta(descuendoInvalido)
      setTimeout(() => { setMensajeRespuesta('') }, 3000)
      return
    } else {
      setEstiloDescuento('')
      setMensajeRespuesta('')
    }

    //--> Preparar envio back-end
    const token = localStorage.getItem('token')
    const cabecera = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    try {
      const respuesta = await axios.post(nuevaTemporada, productoNuevo, cabecera)
      obtenerProductos()
      toast.current.show({ severity: 'success', summary: `${respuesta.data.msg}`, life: 3000 });
      cerrarDialogoCM()
      setProduct(productoVacio)
    } catch (error) {
      console.log(error.response.data)
      setMensajeRespuesta(error.response.data)
      setTimeout(() => { setMensajeRespuesta('') }, 3000);
    }
  }

  //--> PUT
  const actualizarProducto = async (productoEditar) => {
    console.log("Actualizando...")
    // console.log(productoEditar)
    //--> Validar campos llenos
    if (Object.values(productoEditar).includes('') || nombreNuevo === '') {
      if (!productoEditar.nombreTemporada) setEstiloNombre('p-invalid')
      if (!productoEditar.descrTemporada) setEstiloDescripcion('p-invalid')
      // if (!productoEditar.peluches) setEstiloPeluches('p-invalid')
      // if (!productoEditar.flores) setEstiloFlores('p-invalid')
      setMensajeRespuesta(camposVacios)
      setTimeout(() => { setMensajeRespuesta('') }, 3000)
      return
    } else {
      setEstiloNombre('')
      setEstiloDescripcion('')
      // setEstiloPeluches('')
      // setEstiloFlores('')
    }
    //--> Validar Nombre
    if (!validarString.test(productoEditar.nombreTemporada)) {
      setEstiloNombre('p-invalid')
      setMensajeRespuesta(nombreInvalido)
      setTimeout(() => { setMensajeRespuesta('') }, 3000)
      return
    } else {
      setEstiloNombre('')
      setMensajeRespuesta('')
    }
    //--> Validar descripción
    if (!validarString.test(productoEditar.descrTemporada)) {
      setEstiloDescripcion('p-invalid')
      setMensajeRespuesta(descripcionInvalida)
      setTimeout(() => { setMensajeRespuesta('') }, 3000)
      return
    } else {
      setEstiloDescripcion('')
      setMensajeRespuesta('')
    }
    //--> Validar descuento
    if (!validarDescuento.test(productoEditar.descuentoTemporada)) {
      setEstiloDescuento('p-invalid')
      setMensajeRespuesta(descuendoInvalido)
      setTimeout(() => { setMensajeRespuesta('') }, 3000)
      return
    } else {
      setEstiloDescuento('')
      setMensajeRespuesta('')
    }

    //--> Preparar objeto para enviar
    const token = localStorage.getItem('token')
    const cabecera = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    const objetoEnviar = {
      nombreTemporada: product.nombreTemporada,
      newName: nombreNuevo,
      descrTemporada: product.descrTemporada,
      descuentoTemporada: product.descuentoTemporada,
    }
    //--> Mandar objeto al back-end
    try {
      const respuesta = await axios.post(modificarTemporada, objetoEnviar, cabecera)
      toast.current.show({
        severity: 'success', summary: `${respuesta.data.msg}`, life: 3000
      });
      cerrarDialogoCM()

      //--> Limpieza
      setProduct(productoVacio)
      setNombreNuevo('')

      //--> Renderizar despues de enviar
      obtenerProductos()
    } catch (error) {
      // console.log(error.response.data)
      setMensajeRespuesta(error.response.data.msg)
      setTimeout(() => { setMensajeRespuesta('') }, 3000);
    }
  }

  //--> DELETE
  const quitarProducto = async () => {
    console.log("Eliminando producto...")
    console.log(product)
    //--> Crear objeto a eliminar
    const objetoEliminar = { nombreTemporada: product.nombreTemporada }
    const token = localStorage.getItem('token')
    const cabecera = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    //--> Mandar objeto a back-end
    try {
      const respuesta = await axios.post(eliminarTemporada, objetoEliminar, cabecera)
      console.log(respuesta.data.msg)
      toast.current.show({
        severity: 'success', summary: `${respuesta.data.msg}`, life: 3000
      });

      //--> Leer productos otra vez
      obtenerProductos()
      //--> Cerrar dialogo
      cerrarDialogoEliminarRegistro()
    } catch (error) {
      console.log(error.response.data)
      setMensajeRespuesta(error.response.data)
      setTimeout(() => { setMensajeRespuesta('') }, 3000);
    }
  }

  //----------------| Renderizado |----------------
  //--> Cargar cuando se renderiza
  useEffect(() => { obtenerProductos() }, []);

  //--> Revisar si es editar o crear producto
  useEffect(() => {
    if (product._id) setEditar(true)
    else setEditar(false)
  }, [product])

  //--> lista de dropdonws
  useEffect(() => { axios.get(listaFlores).then((e) => { setFloresDrop(e.data.fleurs) }) }, [])
  useEffect(() => { axios.get(listaPeluches).then((e) => { setPeluchesDrop(e.data.plushies) }) }, [])


  //----------------| Interaccion con dialogos |----------------
  const abrirDialogoCM = () => {
    setProduct(productoVacio);
    setNombreNuevo('')
    setProductDialog(true);
    //--> Estilos
    setEstiloNombre('')
    setEstiloDescripcion('')
    setEstiloDescuento('')
    setEstiloFlores('')
    setEstiloPeluches('')
  };

  const cerrarDialogoCM = () => { setProductDialog(false) };

  const cerrarDialogoEliminarRegistro = () => { setDeleteProductDialog(false) };

  const cerrarDialogoEliminarRegistros = () => { setDeleteProductsDialog(false) }

  //----------------| Funcion CRUD |----------------
  const guardarRegistro = async () => {
    //--> Editar registro
    if (product._id) { actualizarProducto(product) }

    //--> Crear registro
    else { crearProducto(product) }
  };

  const editarRegistro = (product) => {
    setProduct({ ...product });
    setProductDialog(true);
  };

  const confirmarEliminarRegistro = (product) => {
    setProduct(product);
    setDeleteProductDialog(true);
  };

  const exportCSV = () => { dt.current.exportCSV() }

  const confirmDeleteSelected = () => { setDeleteProductsDialog(true) }

  //--> DELETE
  const deleteSelectedProducts = () => {
    //--> Preparar objeto para mandar al back-end
    const token = localStorage.getItem('token')
    const cabecera = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    //--> Listar los productos eliminados
    selectedProducts.map(async registro => {
      try {
        const respuesta = await axios.post(eliminarProducto, { nombreProducto: registro.nombreProducto }, cabecera)
        console.log(respuesta.data.msg)
      } catch (error) {
        console.log(error.response.data)
      }
      finally {
        //--> Leer registros de back-end
        obtenerProductos()
        setDeleteProductsDialog(false);
        setSelectedProducts(null);
      }
    })
    toast.current.show({
      severity: 'success', summary: 'Productos eliminados', detail: 'Se ha eliminados correctamente los productos.', life: 3000
    });
  };

  //----------------| Funciones para editar |----------------
  const cambiarString = (e, name) => {
    const val = (e.target && e.target.value) || '';
    let _product = { ...product };
    _product[`${name}`] = val;
    setProduct(_product);
  };

  const cambiarNumero = (e, name) => {
    const val = e.value || 0;
    let _product = { ...product };
    _product[`${name}`] = val;
    setProduct(_product);
  };

  //----------------| Plantillas |----------------
  const plantillaPorcentaje = (rowData) => { return `${rowData.descuentoTemporada} %` }

  //----------------| Botones de dialogos |----------------
  const cabezal = (
    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
      <h4 className="m-0">Control de productos</h4>
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
      </span>
    </div>
  );

  const botonIzquierda = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={abrirDialogoCM} />
        <Button label="Eliminar" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} />
      </div>
    );
  };

  const botonDerecha = () => {
    return <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />;
  };

  const botonesAccion = (rowData) => {
    return (
      <>
        <Button icon="pi pi-pencil" rounded severity="warning" className="mr-2" onClick={() => editarRegistro(rowData)} />
        <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmarEliminarRegistro(rowData)} />
      </>
    );
  };

  const botonesCrearModificar = (
    <>
      <Button label="Guardar" severity="success" icon="pi pi-check" onClick={guardarRegistro} />
      <Button label="Cancelar" security="danger" icon="pi pi-times" outlined onClick={cerrarDialogoCM} />
    </>
  );

  const botonesEliminarRegistro = (
    <>
      <Button label="Sí" icon="pi pi-check" severity="success" onClick={quitarProducto} />
      <Button label="No" icon="pi pi-times" severity="danger" onClick={cerrarDialogoEliminarRegistro} />

    </>
  );

  const botonesEliminarRegistros = (
    <>
      <Button label="Sí" icon="pi pi-check" severity="success" onClick={deleteSelectedProducts} />
      <Button label="No" icon="pi pi-times" severity="danger" onClick={cerrarDialogoEliminarRegistros} />

    </>
  );

  //----------------| Valor que regresara |----------------
  return (
    <Layout
      title="Flores"
      description="Acceso al catálogo de flores"
    >
      <div className="grid">
        <Toast ref={toast} />
        <div className="col-12">
          <div className="card">
            <Toolbar className="mb-4" start={botonIzquierda} end={botonDerecha} />

            <DataTable
              ref={dt} value={products} selection={selectedProducts} onSelectionChange={(e) => setSelectedProducts(e.value)}
              paginator rows={10} rowsPerPageOptions={[5, 10, 25]} showGridlines
              paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
              currentPageReportTemplate="Mostrando {first} - {last} de {totalRecords} registros"
              globalFilter={globalFilter} header={cabezal}
            >
              <Column selectionMode="multiple" exportable={false} />
              <Column field="nombreTemporada" header="Temporada" sortable style={{ minWidth: '12rem', textAlign: "center" }} />
              <Column field="descrTemporada" header="Descripción" sortable style={{ minWidth: '12rem', textAlign: "center" }} />
              <Column field="descuentoTemporada" header="Descuento" sortable body={plantillaPorcentaje}
                style={{ minWidth: '12rem', textAlign: "center" }}
              />
              <Column header="Editar" body={botonesAccion} exportable={false} style={{ minWidth: '12rem' }} />
            </DataTable>

            <Dialog
              visible={productDialog}
              header="Detalles de la temporada" modal className="p-fluid" footer={botonesCrearModificar} onHide={cerrarDialogoCM}
              style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }}
            >
              <div className="field">
                <label htmlFor="nombre" className="font-bold">Nombre de temporada</label>
                <InputText
                  id="nombre" value={product.nombreTemporada} onChange={(e) => cambiarString(e, 'nombreTemporada')}
                  required autoFocus className={estiloNombre}
                />
              </div>
              {editar && (
                <div className="field">
                  <label htmlFor="nombre" className="font-bold">Nuevo nombre</label>
                  <InputText
                    id="nombre" value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)}
                    required autoFocus
                  />
                </div>
              )}
              <div className="field">
                <label htmlFor="descrTemporada" className="font-bold">Descripción</label>
                <InputText
                  id="nombre" value={product.descrTemporada} onChange={(e) => cambiarString(e, 'descrTemporada')}
                  required autoFocus className={estiloDescripcion}
                />
              </div>
              <div className="formgrid grid">
                <div className="field col">
                  <label htmlFor="precio" className="font-bold">Flor</label>
                  <Dropdown
                    value={product.flores} onChange={(e) => cambiarString(e, 'flores')}
                    options={floresDrop} optionLabel="nombreProducto" optionValue="nombreProducto"
                    placeholder="Elija una categoría" className={`w-full md:w-14rem ${estiloFlores}`} />
                </div>
                <div className="field col">
                  <label className="font-bold">Peluche</label>
                  <Dropdown
                    value={product.peluches} onChange={(e) => cambiarString(e, 'peluches')}
                    options={peluchesDrop} optionLabel="nombreProducto" optionValue="nombreProducto"
                    placeholder="Elija un peluche" className={`w-full md:w-14rem ${estiloPeluches}`} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="descuentoTemporada" className="font-bold">Descuento</label>
                <InputNumber
                  id="descuento" value={product.descuentoTemporada}
                  onValueChange={(e) => cambiarNumero(e, 'descuentoTemporada')}
                  suffix=" %" min={0} className={estiloDescuento}
                />
              </div>
              {mensajeRespuesta && (
                <div className="mt-4">
                  <Message severity="error" text={mensajeRespuesta} />
                </div>
              )}
            </Dialog>

            <Dialog
              visible={deleteProductDialog} style={{ width: '32rem' }}
              breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={botonesEliminarRegistro}
              onHide={cerrarDialogoEliminarRegistro}
            >
              <div className="confirmation-content">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                {product && (
                  <span>
                    ¿Está seguro de eliminar <b>{product.nombreTemporada}</b>?
                  </span>
                )}
              </div>
            </Dialog>

            <Dialog visible={deleteProductsDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={botonesEliminarRegistros} onHide={cerrarDialogoEliminarRegistros}>
              <div className="confirmation-content">
                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                {product && <span>¿Está seguro de eliminar los registros?</span>}
              </div>
            </Dialog>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Temporadas
