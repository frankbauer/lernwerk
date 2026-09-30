public class App {
    public static void main(String[] args) {
        Graph<Integer> g = new Graph<>();
        g.add(1); g.add(2); g.add(3); g.add(4);
        g.add(5); g.add(6); g.add(7);

        g.addEdge(1, 2); g.addEdge(1, 3);
        g.addEdge(2, 4); g.addEdge(2, 5);
        g.addEdge(3, 4); g.addEdge(3, 6); g.addEdge(3, 7);
        g.addEdge(4, 5); g.addEdge(4, 6);
        g.addEdge(5, 6);

        System.out.println("Wege von 1: " + MeineWege.wege(6, g.find(1)));
        System.out.println("Wege von 7: " + MeineWege.wege(6, g.find(7)));

        // Die Position der Knoten kann durch Drag & Drop 
        // in der Visualisierung veraendert werden
        g.visualize();
    }
}
