//#START STATIC
class Erkennung {
    public static void main(String[] args) {
        // Kleine Tests mit einem Bild aus 2 Zeilen und 3 Spalten
        boolean bestanden = Netz.teste();
        if (!bestanden) {
            return;
        }

        // Das gezeichnete Bild (10 x 12 Pixel) für das neuronale Netz vorbereiten,
        // in TensorFlow.js: tf.tensor2d(bild).reshape([1, 120]).div(255)
        int[][] bild = Netz.leseBild(args);
        Tensor eingabe = Tensor.tensor2d(bild).reshape(new int[] {1, 120}).div(255);
        Netz.erkenne(eingabe);
    }
}
