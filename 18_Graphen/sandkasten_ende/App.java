public class App {
    public static void main(String[] args) {
        Graph<Integer> g = new Graph<>();
        g.add(3); g.add(8); g.add(1); g.add(6); g.add(5);

        g.addEdge(3, 8); g.addEdge(8, 1); g.addEdge(1, 6);

        System.out.println("Ende ab 3: " + MeinEnde.ende(g.find(3)));
        System.out.println("Ende ab 5: " + MeinEnde.ende(g.find(5)));

        // Die Position der Knoten kann durch Drag & Drop 
        // in der Visualisierung veraendert werden
        g.visualize();
    }
}
