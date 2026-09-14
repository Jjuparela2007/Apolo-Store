// Franja delgada de promesa/urgencia sobre el header. Cambia el texto aquí cuando
// tengas una promoción distinta que anunciar — es el único lugar que hay que tocar.
const MESSAGE = "Envíos gratis en compras superiores a $150.000 en toda Colombia 🚚";

export default function AnnouncementBar() {
  return (
    <div className="bg-apolo-blue text-white text-center text-xs sm:text-sm font-medium py-2 px-4">
      {MESSAGE}
    </div>
  );
}
