public class App {
    public static void main(String[] args) {
        Graph<Integer> g = new Graph<>();
        g.add(2); g.add(3); g.add(5); g.add(6); g.add(8); 
        g.addEdge(3, 2); g.addEdge(3, 6); 
        g.addEdge(6, 2); g.addEdge(2, 5);

        System.out.println("Found: "  + MeineSuche.has(8, g.find(3)));

        g.visualize();
    }
}