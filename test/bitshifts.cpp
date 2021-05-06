#include <iostream>
#include <bitset>
#include <cmath>

int main() {
	std::bitset<8> a(5);
	std::bitset<32> b(1);

	for (int i = 0; i < 8; i++)
		b.reset(b.size() - i - 1);

	std::bitset<32> merge(b);

	merge
	// merge |= a;

	std::cout << a << ", " << b << " => " << merge << std::endl;

	return 0;
}
