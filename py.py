from portfolio.portfolio_analyzer import PortfolioAnalyzer

def main():
    """Main function to run the portfolio analyzer"""
    analyzer = PortfolioAnalyzer()
    try:
        analyzer.run_complete_analysis()
    except KeyboardInterrupt:
        print(f"\n\n  Analysis interrupted by user.")
    except Exception as e:
        print(f"\n Error during analysis: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()