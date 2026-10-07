public class App {
    public static void main(String[] args) {
        Graph<Integer> g = new Graph<>();
        g.add(3); g.add(2); g.add(4); g.add(1);g.add(5);
        g.addEdge(3, 4); g.addEdge(4, 2); 
        g.addEdge(2, 3); g.addEdge(2, 1);

        System.out.println("Summe: "  + MeineSumme.sum(g.find(3)));

        g.visualize();
    }
}